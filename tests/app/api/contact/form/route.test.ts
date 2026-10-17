/**
 * POST /api/contact/form: side effects are gated by flags (SMS off, Discord minimal by default)
 */

jest.mock('@/services/SocialMediaService/DiscordService', () => ({
  __esModule: true,
  default: { sendWebhookMessage: jest.fn().mockResolvedValue(undefined) },
}))

jest.mock('@/services/InAppNotificationService', () => ({
  __esModule: true,
  default: { pushToAdmins: jest.fn().mockResolvedValue(undefined) },
}))

jest.mock('@/services/ContactFormService', () => ({
  __esModule: true,
  default: {
    sanitizeText: (v: string) => v,
    isRateLimited: jest.fn().mockResolvedValue(false),
    isIPRateLimited: jest.fn().mockResolvedValue(false),
    createContactForm: jest.fn().mockResolvedValue({ contactId: 'c-42' }),
    syncToOdoo: jest.fn().mockResolvedValue(true),
  },
}))

jest.mock('@/services/NotificationService/MailService', () => ({
  __esModule: true,
  default: {
    sendContactFormAdminEmail: jest.fn().mockResolvedValue(undefined),
    sendContactFormUserEmail: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@/services/NotificationService/SMSService', () => ({
  __esModule: true,
  default: { sendShortMessage: jest.fn().mockResolvedValue(undefined) },
}))

jest.mock('@/services/AuthService/AuthMiddleware', () => ({
  __esModule: true,
  default: { authenticateUserByRequest: jest.fn() },
}))

jest.mock('@/helpers/SpamProtection', () => ({
  verifyRecaptcha: jest.fn().mockResolvedValue(true),
  checkForSpam: jest.fn().mockReturnValue({ isSpam: false }),
}))

jest.mock('@/middlewares/rateLimit', () => ({
  getClientIP: jest.fn().mockReturnValue('203.0.113.7'),
}))

jest.mock('@/libs/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

import DiscordService from '@/services/SocialMediaService/DiscordService'
import SMSService from '@/services/NotificationService/SMSService'
import ContactFormService from '@/services/ContactFormService'
import MailService from '@/services/NotificationService/MailService'
import { POST } from '@/app/(api)/api/contact/form/route'

const discordMock = DiscordService.sendWebhookMessage as jest.Mock
const smsMock = SMSService.sendShortMessage as jest.Mock
const createMock = ContactFormService.createContactForm as jest.Mock
const syncMock = ContactFormService.syncToOdoo as jest.Mock
const adminMailMock = MailService.sendContactFormAdminEmail as jest.Mock

const BODY = {
  name: 'Test Person',
  email: 'person@example.com',
  phone: '+10000000000',
  message: 'Hello there',
  recaptchaToken: 'token',
}

function buildRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: { get: jest.fn().mockReturnValue(null) },
  } as unknown as NextRequest
}

describe('POST /api/contact/form', () => {
  const saved = { ...process.env }

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.CONTACT_FORM_SMS_AUTOREPLY_ENABLED
    delete process.env.CONTACT_FORM_DISCORD_INCLUDE_DETAILS
  })

  afterAll(() => {
    process.env = saved
  })

  it('sends no SMS and a Discord notice without personal data by default', async () => {
    const response = await POST(buildRequest(BODY))

    expect(response.status).toBe(200)
    expect(smsMock).not.toHaveBeenCalled()
    expect(discordMock).toHaveBeenCalledTimes(1)
    const text = discordMock.mock.calls[0][0] as string
    expect(text).toContain('c-42')
    for (const value of [BODY.name, BODY.email, BODY.phone, BODY.message]) {
      expect(text).not.toContain(value)
    }
  })

  it('sends the SMS auto-reply only when the flag is "true"', async () => {
    process.env.CONTACT_FORM_SMS_AUTOREPLY_ENABLED = 'true'

    await POST(buildRequest(BODY))

    expect(smsMock).toHaveBeenCalledWith(expect.objectContaining({ to: BODY.phone }))
  })

  it('includes details in Discord only when the flag is "true"', async () => {
    process.env.CONTACT_FORM_DISCORD_INCLUDE_DETAILS = 'true'

    await POST(buildRequest(BODY))

    expect(discordMock.mock.calls[0][0]).toContain(BODY.email)
  })
  describe('storing and the Odoo hand-off', () => {
    it('triggers the Odoo sync for the stored submission', async () => {
      await POST(buildRequest(BODY))

      expect(syncMock).toHaveBeenCalledWith('c-42')
    })

    it('still answers 200 when the Odoo sync rejects', async () => {
      syncMock.mockRejectedValueOnce(new Error('Odoo down'))

      const response = await POST(buildRequest(BODY))

      expect(response.status).toBe(200)
    })

    it('does not report success when the message could not be stored', async () => {
      createMock.mockRejectedValueOnce(new Error('db down'))

      const response = await POST(buildRequest(BODY))

      expect(response.status).toBe(500)
      expect(syncMock).not.toHaveBeenCalled()
      // the admin email is the fallback record of the submission
      expect(adminMailMock).toHaveBeenCalledTimes(1)
      expect(discordMock).not.toHaveBeenCalled()
    })
  })

  describe('request validation', () => {
    it('answers 400 for a body that is not JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
        headers: { get: jest.fn().mockReturnValue(null) },
      } as unknown as NextRequest

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(createMock).not.toHaveBeenCalled()
    })

    it.each(['05551234567', '+0123456789', '+12', 'call me'])('rejects the non-E.164 phone %p', async (phone) => {
      const response = await POST(buildRequest({ ...BODY, phone }))

      expect(response.status).toBe(400)
      expect(createMock).not.toHaveBeenCalled()
    })

    it('accepts international names such as José O\'Brien-Müller', async () => {
      const response = await POST(buildRequest({ ...BODY, name: "José O'Brien-Müller" }))

      expect(response.status).toBe(200)
      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ name: "José O'Brien-Müller" }))
    })
  })
})
