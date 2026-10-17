/**
 * Feature flags and message builders for the side effects of a contact-form
 * submission (SMS auto-reply, Discord webhook).
 *
 * Both flags default to OFF. The SMS auto-reply texts whatever number a visitor
 * types into the form, so leaving it on lets anyone make the site send paid SMS
 * to arbitrary numbers. The Discord webhook is a transfer of personal data to a
 * third-party service abroad, so by default it only receives a minimal notice
 * with the record id; the full message stays in the database and the admin panel.
 */

import { z } from 'zod'

type Env =Record<string, string | undefined>

export const CONTACT_FORM_SMS_AUTOREPLY_FLAG = 'CONTACT_FORM_SMS_AUTOREPLY_ENABLED'
export const CONTACT_FORM_DISCORD_DETAILS_FLAG = 'CONTACT_FORM_DISCORD_INCLUDE_DETAILS'

/** Only the literal string "true" (case-insensitive) enables a flag. */
export function isFlagEnabled(env: Env, name: string): boolean {
  return (env[name] ?? '').trim().toLowerCase() === 'true'
}

/** Whether the contact form may send an SMS auto-reply to the submitted number. */
export function isContactSmsAutoReplyEnabled(env: Env = process.env): boolean {
  return isFlagEnabled(env, CONTACT_FORM_SMS_AUTOREPLY_FLAG)
}

/** Whether the Discord notification may include the submitter's personal data. */
export function isContactDiscordDetailsEnabled(env: Env = process.env): boolean {
  return isFlagEnabled(env, CONTACT_FORM_DISCORD_DETAILS_FLAG)
}

export const ContactDiscordInputSchema = z.object({
  contactId: z.string().optional(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
})
export type ContactDiscordInput = z.infer<typeof ContactDiscordInputSchema>

/**
 * Builds the Discord webhook text for a new contact-form submission.
 * Without `includeDetails` it carries no personal data, only the record id.
 */
export function buildContactDiscordMessage(input: ContactDiscordInput, includeDetails: boolean): string {
  const ref = input.contactId ? `id ${input.contactId}` : 'id unavailable'

  if (!includeDetails) {
    return `New contact message (${ref}). Details are in the admin panel: /admin/contacts`
  }

  return (
    `A new message has been received from the contact form (${ref}).\n\n` +
    `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\nMessage: ${input.message}`
  )
}
