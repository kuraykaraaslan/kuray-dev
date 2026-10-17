import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PrivacyNotice from '@/components/frontend/Features/Legal/PrivacyNotice'
import { PrivacyNoticeContentSchema, type PrivacyNoticeContent } from '@/dtos/LegalDTO'
import { buildLangUrl, robotsFor } from '@/helpers/HreflangHelper'
import { isFlagEnabled } from '@/helpers/ContactFormNotificationHelper'
import { getDictionary, getPageMetadata } from '@/libs/localize/getDictionary'

// DRAFT: needs legal review. The page stays a 404 (as before) unless this flag is "true",
// so a deploy does not publish unreviewed legal text. Not linked from navigation or the sitemap.
const PRIVACY_NOTICE_FLAG = 'PRIVACY_NOTICE_DRAFT_ENABLED'

type Props = {
  params: Promise<{ lang: string }>
}

function readContent(dict: Record<string, unknown>): PrivacyNoticeContent | undefined {
  const pages = dict.pages as { privacy_notice?: unknown } | undefined
  const parsed = PrivacyNoticeContentSchema.safeParse(pages?.privacy_notice)
  return parsed.success ? parsed.data : undefined
}

async function loadContent(lang: string): Promise<PrivacyNoticeContent | undefined> {
  // Only the English draft exists until legal review; other locales fall back to it.
  return readContent(await getDictionary(lang)) ?? readContent(await getDictionary('en'))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { title, description } = await getPageMetadata(lang, 'privacy_policy')

  return {
    title: { absolute: title },
    description,
    // Draft: never indexed until the reviewed version replaces it
    robots: robotsFor(false),
    alternates: { canonical: buildLangUrl(lang, '/privacy-policy') },
  }
}

export default async function PrivacyPolicyPage({ params }: Props) {
  if (!isFlagEnabled(process.env, PRIVACY_NOTICE_FLAG)) notFound()

  const { lang } = await params
  const content = await loadContent(lang)
  if (!content) notFound()

  return <PrivacyNotice content={content} />
}
