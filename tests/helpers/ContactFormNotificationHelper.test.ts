import {
  buildContactDiscordMessage,
  isContactDiscordDetailsEnabled,
  isContactSmsAutoReplyEnabled,
  isFlagEnabled,
} from '@/helpers/ContactFormNotificationHelper'

const INPUT = {
  contactId: 'c-123',
  name: 'Test Person',
  email: 'person@example.com',
  phone: '+10000000000',
  message: 'Hello there',
}

describe('ContactFormNotificationHelper', () => {
  describe('flags', () => {
    it('are off when unset', () => {
      expect(isContactSmsAutoReplyEnabled({})).toBe(false)
      expect(isContactDiscordDetailsEnabled({})).toBe(false)
    })

    it('are on only for the literal "true"', () => {
      expect(isFlagEnabled({ X: 'true' }, 'X')).toBe(true)
      expect(isFlagEnabled({ X: ' TRUE ' }, 'X')).toBe(true)
      for (const value of ['1', 'yes', 'on', 'false', '']) {
        expect(isFlagEnabled({ X: value }, 'X')).toBe(false)
      }
    })

    it('read the documented variable names', () => {
      expect(isContactSmsAutoReplyEnabled({ CONTACT_FORM_SMS_AUTOREPLY_ENABLED: 'true' })).toBe(true)
      expect(isContactDiscordDetailsEnabled({ CONTACT_FORM_DISCORD_INCLUDE_DETAILS: 'true' })).toBe(true)
    })
  })

  describe('buildContactDiscordMessage', () => {
    it('carries no personal data by default', () => {
      const text = buildContactDiscordMessage(INPUT, false)
      expect(text).toContain('c-123')
      for (const value of [INPUT.name, INPUT.email, INPUT.phone, INPUT.message]) {
        expect(text).not.toContain(value)
      }
    })

    it('includes details only when enabled', () => {
      const text = buildContactDiscordMessage(INPUT, true)
      for (const value of [INPUT.name, INPUT.email, INPUT.phone, INPUT.message]) {
        expect(text).toContain(value)
      }
    })

    it('handles a missing id', () => {
      expect(buildContactDiscordMessage({ ...INPUT, contactId: undefined }, false)).toContain('id unavailable')
    })
  })
})
