import Logger from '@/libs/logger'

/**
 * Minimal Odoo client over the external JSON-RPC endpoint (`/jsonrpc`).
 *
 * That endpoint exists on Odoo 18 (the production CRM) and still on 19, unlike
 * the newer `/json/2/...` API which is Odoo 19 only. A call is
 * `execute_kw(db, uid, api_key, model, method, args, kwargs)`; the uid comes
 * from `common.authenticate(db, login, api_key)`. The API key belongs to a
 * dedicated integration user, so it only has the rights that user has in Odoo.
 */

type OdooConfig = {
  url: string
  db: string
  login: string
  apiKey: string
  leadType: 'lead' | 'opportunity'
  teamId?: number
  userId?: number
  sourceName: string
  mediumName: string
}

export type OdooLeadInput = {
  name: string
  email: string
  phone: string
  message: string
}

const REQUEST_TIMEOUT_MS = 10_000

export default class OdooService {
  /** utm.source / utm.medium ids are stable, so they're looked up once per process. */
  private static utmCache = new Map<string, number | null>()
  /** uid per `url|db|login`; an API key change needs a process restart anyway. */
  private static uidCache = new Map<string, number>()

  static isEnabled(env: Record<string, string | undefined> = process.env): boolean {
    return (env.ODOO_SYNC_ENABLED ?? '').trim().toLowerCase() === 'true'
  }

  /** Returns the config, or throws a readable error naming the missing variables. */
  static getConfig(env: Record<string, string | undefined> = process.env): OdooConfig {
    const missing = ['ODOO_URL', 'ODOO_DB', 'ODOO_LOGIN', 'ODOO_API_KEY'].filter((key) => !env[key]?.trim())
    if (missing.length > 0) {
      throw new Error(`Odoo is not configured, missing: ${missing.join(', ')}`)
    }

    const toId = (value?: string) => {
      const parsed = Number.parseInt(value ?? '', 10)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
    }

    return {
      url: env.ODOO_URL!.trim().replace(/\/+$/, ''),
      db: env.ODOO_DB!.trim(),
      login: env.ODOO_LOGIN!.trim(),
      apiKey: env.ODOO_API_KEY!.trim(),
      leadType: env.ODOO_LEAD_TYPE?.trim() === 'opportunity' ? 'opportunity' : 'lead',
      teamId: toId(env.ODOO_LEAD_TEAM_ID),
      userId: toId(env.ODOO_LEAD_USER_ID),
      sourceName: env.ODOO_LEAD_SOURCE?.trim() || 'Website',
      mediumName: env.ODOO_LEAD_MEDIUM?.trim() || 'Contact form',
    }
  }

  private static async rpc<T>(config: OdooConfig, service: 'common' | 'object', method: string, args: unknown[]): Promise<T> {
    const response = await fetch(`${config.url}/jsonrpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'kuray-dev-site',
      },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args }, id: Date.now() }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    const text = await response.text()
    let payload: any = null
    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      // Non-JSON body (e.g. a proxy error page) — handled below via the status code.
    }

    if (!response.ok) {
      throw new Error(`Odoo ${service}.${method} failed (${response.status}): ${text.slice(0, 200)}`)
    }
    if (payload?.error) {
      // Odoo reports application errors with HTTP 200 and an `error` object.
      const detail = payload.error.data?.message || payload.error.message || 'unknown error'
      throw new Error(`Odoo ${service}.${method} failed: ${detail}`)
    }
    if (!payload || !('result' in payload)) {
      throw new Error(`Odoo ${service}.${method} returned an unexpected response`)
    }

    return payload.result as T
  }

  private static async getUid(config: OdooConfig): Promise<number> {
    const key = `${config.url}|${config.db}|${config.login}`
    const cached = this.uidCache.get(key)
    if (cached) return cached

    const uid = await this.rpc<number | false>(config, 'common', 'authenticate', [config.db, config.login, config.apiKey, {}])
    if (!uid) {
      throw new Error('Odoo authentication failed: check ODOO_LOGIN and ODOO_API_KEY')
    }
    this.uidCache.set(key, uid)
    return uid
  }

  private static async call<T>(config: OdooConfig, model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}): Promise<T> {
    const uid = await this.getUid(config)
    return this.rpc<T>(config, 'object', 'execute_kw', [config.db, uid, config.apiKey, model, method, args, kwargs])
  }

  /** Finds a utm.source / utm.medium by name, creating it when missing. Never throws. */
  private static async resolveUtm(config: OdooConfig, model: 'utm.source' | 'utm.medium', name: string): Promise<number | undefined> {
    const key = `${model}:${name}`
    const cached = this.utmCache.get(key)
    if (cached !== undefined) return cached ?? undefined

    try {
      const found = await this.call<number[]>(config, model, 'search', [[['name', '=', name]]], { limit: 1 })
      const id = found[0] ?? (await this.call<number>(config, model, 'create', [{ name }]))
      this.utmCache.set(key, id ?? null)
      return id
    } catch (error) {
      // Tracking tags are optional; the lead itself must not depend on them.
      Logger.warn(`[Odoo] Could not resolve ${model} "${name}": ${error}`)
      return undefined
    }
  }

  /** crm.lead.description is an HTML field: escape the text and keep its line breaks. */
  static toHtml(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    return `<p>${escaped.replace(/\r?\n/g, '<br>')}</p>`
  }

  /** Creates a crm.lead for a contact-form submission and returns its Odoo id. */
  static async createLead(input: OdooLeadInput, env: Record<string, string | undefined> = process.env): Promise<number> {
    const config = this.getConfig(env)

    // Authenticate first so a bad key fails once with a clear message instead of in every utm lookup.
    await this.getUid(config)

    const [sourceId, mediumId] = await Promise.all([
      this.resolveUtm(config, 'utm.source', config.sourceName),
      this.resolveUtm(config, 'utm.medium', config.mediumName),
    ])

    const vals: Record<string, unknown> = {
      name: `Website contact – ${input.name}`,
      type: config.leadType,
      contact_name: input.name,
      email_from: input.email,
      phone: input.phone,
      description: OdooService.toHtml(input.message),
    }
    if (config.teamId) vals.team_id = config.teamId
    if (config.userId) vals.user_id = config.userId
    if (sourceId) vals.source_id = sourceId
    if (mediumId) vals.medium_id = mediumId

    const id = await this.call<number>(config, 'crm.lead', 'create', [vals])
    if (!Number.isInteger(id)) {
      throw new Error('Odoo crm.lead.create returned no id')
    }
    return id
  }
}
