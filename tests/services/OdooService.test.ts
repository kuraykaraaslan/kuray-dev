import OdooService from '@/services/OdooService'

jest.mock('@/libs/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const ENV = {
  ODOO_SYNC_ENABLED: 'true',
  ODOO_URL: 'https://crm.example.com/',
  ODOO_DB: 'crm',
  ODOO_LOGIN: 'website-integration@example.com',
  ODOO_API_KEY: 'secret-key',
}

const INPUT = { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+905551234567', message: 'Hi <b>there</b>\nSecond line' }

const ok = (result: unknown) =>
  ({ ok: true, status: 200, text: async () => JSON.stringify({ jsonrpc: '2.0', id: 1, result }) }) as Response
const rpcError = (message: string) =>
  ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: 200, message: 'Odoo Server Error', data: { message } } }),
  }) as Response

type Handler = (args: any[]) => Response
type Calls = { service: string; method: string; args: any[] }[]

/** Routes /jsonrpc requests by `service.method[.model.method]` and records every call. */
function mockOdoo(handlers: Record<string, Handler>): Calls {
  const calls: Calls = []
  ;(global as any).fetch = jest.fn(async (url: string, init: any) => {
    expect(url).toBe('https://crm.example.com/jsonrpc')
    const { service, method, args } = JSON.parse(init.body).params
    calls.push({ service, method, args })
    const key = service === 'object' ? `object.${args[3]}.${args[4]}` : `${service}.${method}`
    const handler = handlers[key]
    if (!handler) throw new Error(`unexpected Odoo call: ${key}`)
    return handler(args)
  })
  return calls
}

const GOOD: Record<string, Handler> = {
  'common.authenticate': () => ok(7),
  'object.utm.source.search': () => ok([11]),
  'object.utm.medium.search': () => ok([22]),
  'object.crm.lead.create': () => ok(987),
}

describe('OdooService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(OdooService as any).utmCache.clear()
    ;(OdooService as any).uidCache.clear()
  })

  describe('isEnabled', () => {
    it('is off unless ODOO_SYNC_ENABLED is "true"', () => {
      expect(OdooService.isEnabled({})).toBe(false)
      expect(OdooService.isEnabled({ ODOO_SYNC_ENABLED: 'yes' })).toBe(false)
      expect(OdooService.isEnabled({ ODOO_SYNC_ENABLED: ' TRUE ' })).toBe(true)
    })
  })

  describe('getConfig', () => {
    it('names every missing required variable', () => {
      expect(() => OdooService.getConfig({ ODOO_URL: 'https://x' })).toThrow('ODOO_DB, ODOO_LOGIN, ODOO_API_KEY')
    })

    it('trims the trailing slash and parses optional ids', () => {
      const config = OdooService.getConfig({ ...ENV, ODOO_LEAD_TEAM_ID: '3', ODOO_LEAD_USER_ID: 'abc' })
      expect(config.url).toBe('https://crm.example.com')
      expect(config.teamId).toBe(3)
      expect(config.userId).toBeUndefined()
      expect(config.leadType).toBe('lead')
    })
  })

  describe('toHtml', () => {
    it('escapes markup and keeps line breaks', () => {
      expect(OdooService.toHtml('a <b>&</b>\nb')).toBe('<p>a &lt;b&gt;&amp;&lt;/b&gt;<br>b</p>')
    })
  })

  describe('createLead', () => {
    it('authenticates, then creates a crm.lead through execute_kw and returns its id', async () => {
      const calls = mockOdoo(GOOD)

      const id = await OdooService.createLead(INPUT, { ...ENV, ODOO_LEAD_TEAM_ID: '5' })

      expect(id).toBe(987)
      const auth = calls.find((c) => c.method === 'authenticate')!
      expect(auth.service).toBe('common')
      expect(auth.args).toEqual(['crm', 'website-integration@example.com', 'secret-key', {}])

      const create = calls.find((c) => c.args[3] === 'crm.lead' && c.args[4] === 'create')!
      expect(create.service).toBe('object')
      expect(create.method).toBe('execute_kw')
      expect(create.args.slice(0, 3)).toEqual(['crm', 7, 'secret-key'])
      const vals = create.args[5][0]
      expect(vals).toMatchObject({
        name: 'Website contact – Ada Lovelace',
        type: 'lead',
        contact_name: 'Ada Lovelace',
        email_from: 'ada@example.com',
        phone: '+905551234567',
        team_id: 5,
        source_id: 11,
        medium_id: 22,
      })
      expect(vals.description).toBe('<p>Hi &lt;b&gt;there&lt;/b&gt;<br>Second line</p>')
    })

    it('authenticates only once across several leads', async () => {
      const calls = mockOdoo(GOOD)

      await OdooService.createLead(INPUT, ENV)
      await OdooService.createLead(INPUT, ENV)

      expect(calls.filter((c) => c.method === 'authenticate')).toHaveLength(1)
      expect(calls.filter((c) => c.args[3] === 'crm.lead')).toHaveLength(2)
    })

    it('creates the utm source/medium when they do not exist yet', async () => {
      const calls = mockOdoo({
        ...GOOD,
        'object.utm.source.search': () => ok([]),
        'object.utm.medium.search': () => ok([]),
        'object.utm.source.create': () => ok(31),
        'object.utm.medium.create': () => ok(32),
      })

      await OdooService.createLead(INPUT, ENV)

      expect(calls.some((c) => c.args[3] === 'utm.source' && c.args[4] === 'create')).toBe(true)
      expect(calls.some((c) => c.args[3] === 'utm.medium' && c.args[4] === 'create')).toBe(true)
      const vals = calls.find((c) => c.args[3] === 'crm.lead')!.args[5][0]
      expect(vals).toMatchObject({ source_id: 31, medium_id: 32 })
    })

    it('still creates the lead when the utm lookups are refused', async () => {
      const calls = mockOdoo({
        ...GOOD,
        'object.utm.source.search': () => rpcError('AccessError'),
        'object.utm.medium.search': () => rpcError('AccessError'),
      })

      await expect(OdooService.createLead(INPUT, ENV)).resolves.toBe(987)
      const vals = calls.find((c) => c.args[3] === 'crm.lead')!.args[5][0]
      expect(vals.source_id).toBeUndefined()
      expect(vals.medium_id).toBeUndefined()
    })

    it('fails once, with a clear message, when the credentials are wrong', async () => {
      const calls = mockOdoo({ 'common.authenticate': () => ok(false) })

      await expect(OdooService.createLead(INPUT, ENV)).rejects.toThrow('authentication failed')
      expect(calls).toHaveLength(1)
    })

    it('throws with Odoo\'s message when the create is refused', async () => {
      mockOdoo({ ...GOOD, 'object.crm.lead.create': () => rpcError('Invalid field: bogus') })

      await expect(OdooService.createLead(INPUT, ENV)).rejects.toThrow('Invalid field: bogus')
    })

    it('throws on an HTTP error such as a proxy 502', async () => {
      mockOdoo({ 'common.authenticate': () => ({ ok: false, status: 502, text: async () => '<html>Bad Gateway</html>' }) as Response })

      await expect(OdooService.createLead(INPUT, ENV)).rejects.toThrow('(502)')
    })

    it('throws when Odoo returns no id', async () => {
      mockOdoo({ ...GOOD, 'object.crm.lead.create': () => ok(false) })

      await expect(OdooService.createLead(INPUT, ENV)).rejects.toThrow('returned no id')
    })

    it('rejects before any request when the config is incomplete', async () => {
      const calls = mockOdoo(GOOD)

      await expect(OdooService.createLead(INPUT, { ODOO_SYNC_ENABLED: 'true' })).rejects.toThrow('not configured')
      expect(calls).toHaveLength(0)
    })
  })
})
