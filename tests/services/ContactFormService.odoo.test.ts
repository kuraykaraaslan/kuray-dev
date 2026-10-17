import ContactFormService from '@/services/ContactFormService'
import OdooService from '@/services/OdooService'
import DiscordService from '@/services/SocialMediaService/DiscordService'
import { prisma } from '@/libs/prisma'
import redisInstance from '@/libs/redis'

jest.mock('@/libs/prisma', () => ({
  prisma: {
    contactForm: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/libs/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

jest.mock('@/services/OdooService', () => ({
  __esModule: true,
  default: { isEnabled: jest.fn(), createLead: jest.fn() },
}))

jest.mock('@/services/SocialMediaService/DiscordService', () => ({
  __esModule: true,
  default: { sendWebhookMessage: jest.fn().mockResolvedValue(undefined) },
}))

const prismaMock = prisma as any
const odooMock = OdooService as any
const redisMock = redisInstance as any
const discordMock = DiscordService.sendWebhookMessage as jest.Mock

const row = {
  contactId: 'cf-1',
  name: 'Ada',
  email: 'ada@example.com',
  phone: '+905551234567',
  message: 'Hello',
  odooSyncStatus: 'PENDING',
  odooSyncAttempts: 0,
}

describe('ContactFormService – Odoo sync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    odooMock.isEnabled.mockReturnValue(true)
    redisMock.set.mockResolvedValue('OK')
    prismaMock.contactForm.findFirst.mockResolvedValue(row)
    prismaMock.contactForm.update.mockResolvedValue({})
  })

  describe('syncToOdoo', () => {
    it('does nothing while the integration is disabled', async () => {
      odooMock.isEnabled.mockReturnValue(false)

      await expect(ContactFormService.syncToOdoo('cf-1')).resolves.toBe(false)
      expect(redisMock.set).not.toHaveBeenCalled()
      expect(odooMock.createLead).not.toHaveBeenCalled()
    })

    it('skips when another process holds the lock', async () => {
      redisMock.set.mockResolvedValue(null)

      await expect(ContactFormService.syncToOdoo('cf-1')).resolves.toBe(false)
      expect(prismaMock.contactForm.findFirst).not.toHaveBeenCalled()
      expect(odooMock.createLead).not.toHaveBeenCalled()
    })

    it('only loads rows that are unsynced and below the attempt cap', async () => {
      prismaMock.contactForm.findFirst.mockResolvedValue(null)

      await expect(ContactFormService.syncToOdoo('cf-1')).resolves.toBe(false)
      expect(prismaMock.contactForm.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          contactId: 'cf-1',
          deletedAt: null,
          odooSyncStatus: { in: ['PENDING', 'FAILED'] },
          odooSyncAttempts: { lt: ContactFormService.ODOO_MAX_ATTEMPTS },
        }),
      })
      expect(odooMock.createLead).not.toHaveBeenCalled()
      expect(redisMock.del).toHaveBeenCalledWith('contact_form_odoo_sync:cf-1')
    })

    it('creates the lead and marks the row SYNCED', async () => {
      odooMock.createLead.mockResolvedValue(321)

      await expect(ContactFormService.syncToOdoo('cf-1')).resolves.toBe(true)

      expect(odooMock.createLead).toHaveBeenCalledWith({
        name: 'Ada',
        email: 'ada@example.com',
        phone: '+905551234567',
        message: 'Hello',
      })
      expect(prismaMock.contactForm.update).toHaveBeenCalledWith({
        where: { contactId: 'cf-1' },
        data: expect.objectContaining({ odooSyncStatus: 'SYNCED', odooLeadId: 321, odooSyncError: null }),
      })
      expect(redisMock.del).toHaveBeenCalledWith('contact_form_odoo_sync:cf-1')
    })

    it('records the failure, keeps the row retryable and never throws', async () => {
      odooMock.createLead.mockRejectedValue(new Error('Odoo down'))

      await expect(ContactFormService.syncToOdoo('cf-1')).resolves.toBe(false)

      expect(prismaMock.contactForm.update).toHaveBeenCalledWith({
        where: { contactId: 'cf-1' },
        data: { odooSyncStatus: 'FAILED', odooSyncAttempts: 1, odooSyncError: 'Odoo down' },
      })
      expect(discordMock).not.toHaveBeenCalled()
      expect(redisMock.del).toHaveBeenCalled()
    })

    it('alerts on Discord, without personal data, when the last attempt fails', async () => {
      prismaMock.contactForm.findFirst.mockResolvedValue({
        ...row,
        odooSyncStatus: 'FAILED',
        odooSyncAttempts: ContactFormService.ODOO_MAX_ATTEMPTS - 1,
      })
      odooMock.createLead.mockRejectedValue(new Error('Odoo down'))

      await ContactFormService.syncToOdoo('cf-1')

      expect(discordMock).toHaveBeenCalledTimes(1)
      const text = discordMock.mock.calls[0][0] as string
      expect(text).toContain('cf-1')
      expect(text).not.toContain('ada@example.com')
    })
  })

  describe('syncPendingToOdoo', () => {
    it('does nothing while the integration is disabled', async () => {
      odooMock.isEnabled.mockReturnValue(false)

      await expect(ContactFormService.syncPendingToOdoo()).resolves.toEqual({ synced: 0, failed: 0 })
      expect(prismaMock.contactForm.findMany).not.toHaveBeenCalled()
    })

    it('retries the oldest unsynced rows first and counts the results', async () => {
      prismaMock.contactForm.findMany.mockResolvedValue([{ contactId: 'cf-1' }, { contactId: 'cf-2' }])
      odooMock.createLead.mockResolvedValueOnce(1).mockRejectedValueOnce(new Error('boom'))

      const result = await ContactFormService.syncPendingToOdoo(10)

      expect(result).toEqual({ synced: 1, failed: 1 })
      expect(prismaMock.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ odooSyncStatus: { in: ['PENDING', 'FAILED'] }, deletedAt: null }),
          orderBy: { createdAt: 'asc' },
          take: 10,
        })
      )
    })
  })
})
