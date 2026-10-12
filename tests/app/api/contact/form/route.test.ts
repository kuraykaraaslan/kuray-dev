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
import { POST } from '@/app/(api)/api/contact/form/route'

const discordMock = DiscordService.sendWebhookMessage as jest.Mock
const smsMock = SMSService.sendShortMessage as jest.Mock

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
})
