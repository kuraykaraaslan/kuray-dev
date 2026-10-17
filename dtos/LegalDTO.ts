import { z } from 'zod'

/** One section of a legal notice; `items` render as a bullet list after `body`. */
export const LegalSectionSchema = z.object({
  title: z.string(),
  body: z.string(),
  items: z.record(z.string()).optional(),
})

/** Shape of `pages.privacy_notice` in the locale dictionaries. */
export const PrivacyNoticeContentSchema = z.object({
  draft_banner: z.string(),
  title: z.string(),
  subtitle: z.string(),
  last_updated: z.string(),
  sections: z.record(LegalSectionSchema),
})

export type LegalSection = z.infer<typeof LegalSectionSchema>
export type PrivacyNoticeContent = z.infer<typeof PrivacyNoticeContentSchema>
