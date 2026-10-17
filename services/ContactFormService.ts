import { ContactForm } from '@/types/features/ContactTypes'
import { prisma } from '@/libs/prisma'
import redisInstance from '@/libs/redis'
import Logger from '@/libs/logger'
import OdooService from '@/services/OdooService'
import DiscordService from '@/services/SocialMediaService/DiscordService'

export default class ContactFormService {
  private static sqlInjectionRegex =
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)|(--)|(\b(AND|OR|NOT|IS|NULL|LIKE|IN|BETWEEN|EXISTS|CASE|WHEN|THEN|END|JOIN|INNER|LEFT|RIGHT|OUTER|FULL|HAVING|GROUP|BY|ORDER|ASC|DESC|LIMIT|OFFSET)\b)/i // SQL injection prevention

  /**
   * Strips HTML markup and control characters from free-text user input.
   * Used on name/phone/message before they're persisted or forwarded to
   * email/Discord. Regex-based rather than isomorphic-dompurify because
   * the latter pulls in jsdom, which breaks under Jest's node test
   * environment; this only needs to strip tags, not parse real markup.
   */
  static sanitizeText(value: string): string {
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .trim()
  }

  /**
   * Creates a new contact form with regex validation.
   * @param data - Contact form data
   * @returns The created contact form
   */
  static async createContactForm(data: {
    name: string
    email: string
    message: string
    phone: string
  }): Promise<any> {
    let { name, email, message, phone } = data

    // Validate input
    if (!name || !email || !message) {
      throw new Error('All fields are required.')
    }

    name = this.sanitizeText(name)
    message = this.sanitizeText(message)
    phone = this.sanitizeText(phone)

    // Create the contact form
    const contactForm = await prisma.contactForm.create({
      data: {
        name,
        email,
        message,
        phone,
      },
    })

    return contactForm
  }

  /** ~5 hours of retries at the 5-minute cron before a submission is parked as FAILED for manual action. */
  static readonly ODOO_MAX_ATTEMPTS = 60

  /**
   * Pushes one stored submission to Odoo as a crm.lead.
   * Safe to call repeatedly and concurrently: a short Redis lock prevents the
   * request-time attempt and the cron retry from creating the same lead twice,
   * and only PENDING/FAILED rows below the attempt cap are processed.
   * Never throws; returns true when the lead exists in Odoo afterwards.
   */
  static async syncToOdoo(contactId: string): Promise<boolean> {
    if (!OdooService.isEnabled()) return false

    const lockKey = `contact_form_odoo_sync:${contactId}`
    const locked = await redisInstance.set(lockKey, '1', 'EX', 60, 'NX')
    if (locked !== 'OK') return false

    try {
      const row = await prisma.contactForm.findFirst({
        where: {
          contactId,
          deletedAt: null,
          odooSyncStatus: { in: ['PENDING', 'FAILED'] },
          odooSyncAttempts: { lt: this.ODOO_MAX_ATTEMPTS },
        },
      })
      if (!row) return false

      try {
        const leadId = await OdooService.createLead({
          name: row.name,
          email: row.email,
          phone: row.phone,
          message: row.message,
        })
        await prisma.contactForm.update({
          where: { contactId },
          data: {
            odooSyncStatus: 'SYNCED',
            odooLeadId: leadId,
            odooSyncError: null,
            odooSyncedAt: new Date(),
            odooSyncAttempts: { increment: 1 },
          },
        })
        return true
      } catch (error: any) {
        const attempts = row.odooSyncAttempts + 1
        Logger.error(`[ContactForm] Odoo sync failed for ${contactId} (attempt ${attempts}): ${error?.message ?? error}`)
        await prisma.contactForm.update({
          where: { contactId },
          data: {
            odooSyncStatus: 'FAILED',
            odooSyncAttempts: attempts,
            odooSyncError: String(error?.message ?? error).slice(0, 500),
          },
        })
        if (attempts === this.ODOO_MAX_ATTEMPTS) {
          await DiscordService.sendWebhookMessage(
            `Odoo sync gave up after ${attempts} attempts for contact form ${contactId}. Create the lead manually from /admin/contacts.`
          ).catch(() => {})
        }
        return false
      }
    } finally {
      try {
        await redisInstance.del(lockKey)
      } catch {
        // The lock expires on its own after 60s
      }
    }
  }

  /**
   * Retries submissions that have not reached Odoo yet (oldest first).
   * Called by the 5-minute cron job.
   */
  static async syncPendingToOdoo(limit = 20): Promise<{ synced: number; failed: number }> {
    if (!OdooService.isEnabled()) return { synced: 0, failed: 0 }

    const rows = await prisma.contactForm.findMany({
      where: {
        deletedAt: null,
        odooSyncStatus: { in: ['PENDING', 'FAILED'] },
        odooSyncAttempts: { lt: this.ODOO_MAX_ATTEMPTS },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { contactId: true },
    })

    let synced = 0
    let failed = 0
    for (const { contactId } of rows) {
      if (await this.syncToOdoo(contactId)) synced++
      else failed++
    }
    return { synced, failed }
  }

  /**
   * Retrieves all contact forms with optional pagination and search.
   * @param page - The page number
   * @param pageSize - The page size
   * @param search - The search query
   * @returns The contact forms and total count
   * */
  static async getAllContactForms(
    page: number,
    pageSize: number,
    search?: string,
    sortKey?: string,
    sortDir?: 'asc' | 'desc',
  ): Promise<{ contactForms: ContactForm[]; total: number }> {
    if (search && this.sqlInjectionRegex.test(search)) {
      throw new Error('Invalid search query.')
    }

    const ALLOWED_SORT_KEYS: Record<string, string> = { name: 'name', email: 'email', createdAt: 'createdAt' }
    const resolvedSortKey = (sortKey && ALLOWED_SORT_KEYS[sortKey]) ?? 'createdAt'
    const resolvedSortDir: 'asc' | 'desc' = sortDir === 'asc' ? 'asc' : 'desc'

    const where = search
      ? {
          deletedAt: null,
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { message: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : { deletedAt: null }

    const contactForms = await prisma.contactForm.findMany({
      take: pageSize,
      skip: page * pageSize,
      where,
      orderBy: { [resolvedSortKey]: resolvedSortDir },
    })

    const total = await prisma.contactForm.count({ where })

    return { contactForms, total }
  }

  /**
   * Retrieves a contact form by its ID.
   * @param contactFormId - The contact form ID
   * @returns The contact form
   */
  static async getContactFormById(contactId: string): Promise<ContactForm | null> {
    return await prisma.contactForm.findFirst({
      where: { contactId, deletedAt: null },
    })
  }

  static getRecentContactFormEntriesByPhoneOrEmail(phone: string, email: string): any {
    // Find recent contact form entries in 24 hours

    const recentEntries = prisma.contactForm.findMany({
      where: {
        OR: [{ phone: phone }, { email: email }],
        createdAt: {
          gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        },
      },
    })

    return recentEntries
  }

  static async isRateLimited(phone: string, email: string, maxEntries = 4): Promise<boolean> {
    const recentEntries = await this.getRecentContactFormEntriesByPhoneOrEmail(phone, email)
    return recentEntries.length > maxEntries
  }

  /**
   * Per-IP daily cap, independent of the submitted email/phone.
   * isRateLimited() alone can be bypassed by submitting a different
   * target email/phone on every request; this closes that gap.
   */
  static async isIPRateLimited(ip: string, maxEntries = 20, windowSeconds = 24 * 60 * 60): Promise<boolean> {
    if (!ip || ip === 'unknown') {
      return false
    }

    const key = `contact_form_ip:${ip}`
    const count = await redisInstance.incr(key)

    if (count === 1) {
      await redisInstance.expire(key, windowSeconds)
    }

    return count > maxEntries
  }

  /**
   * Deletes a contact form by its ID.
   * @param contactId - The contact form ID
   * @returns The deleted contact form
   */
  static async deleteContactForm(contactId: string): Promise<ContactForm | null> {
    const contactForm = await prisma.contactForm.findFirst({
      where: { contactId, deletedAt: null },
    })

    if (!contactForm) {
      return null
    }

    await prisma.contactForm.update({
      where: { contactId },
      data: { deletedAt: new Date() },
    })

    return contactForm as ContactForm
  }
}
