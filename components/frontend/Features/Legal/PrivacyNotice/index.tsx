import type { PrivacyNoticeContent } from '@/dtos/LegalDTO'

interface Props {
  content: PrivacyNoticeContent
}

const PrivacyNotice = ({ content }: Props) => {
  return (
    <div className="bg-base-100 min-h-screen py-24">
      <article className="px-4 mx-auto max-w-screen-md lg:px-6">
        <div role="note" className="alert alert-warning mb-10 text-sm font-semibold">
          {content.draft_banner}
        </div>

        <header className="mb-12">
          <h1 className="mb-4 font-bold text-fluid-hero">{content.title}</h1>
          <p className="font-light sm:text-xl opacity-80">{content.subtitle}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] opacity-50">{content.last_updated}</p>
        </header>

        <div className="divide-y divide-base-content/10 border-t border-base-content/10">
          {Object.entries(content.sections).map(([key, section]) => (
            <section key={key} className="py-8">
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              <p className="text-sm leading-relaxed opacity-80">{section.body}</p>
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed opacity-80">
                  {Object.entries(section.items).map(([itemKey, item]) => (
                    <li key={itemKey}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}

export default PrivacyNotice
