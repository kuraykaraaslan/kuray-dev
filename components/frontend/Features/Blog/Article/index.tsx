import DOMPurify from 'isomorphic-dompurify'
import { addHeadingIds } from '@/helpers/tocUtils'

function injectImgAttributes(html: string): string {
  // Add loading="lazy" to every <img> that doesn't already have it.
  // Also inject width/height="auto" so browsers reserve space and CLS is reduced.
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    let out = attrs
    if (!/\bloading=/.test(attrs)) out += ' loading="lazy"'
    if (!/\bwidth=/.test(attrs)) out += ' width="800"'
    if (!/\bheight=/.test(attrs)) out += ' height="600"'
    return `<img${out}>`
  })
}

export default function Article(doc: { title : string; content: string; image: string }) {

  const sanitizedHTML = DOMPurify.sanitize(doc.content ?? '', {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'blockquote',
      'code',
      'pre',
      'img',
      'br',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'id', 'loading', 'width', 'height'],
  })

  // Add IDs to headings for anchor links, then lazy-load inline images
  const safeHTML = injectImgAttributes(addHeadingIds(sanitizedHTML))

  return (
    <div className="max-w-none justify-center text-left mx-auto prose mb-8 max-w-none">
      <div dangerouslySetInnerHTML={{ __html: safeHTML }} className="prose mt-4 max-w-none" />
    </div>
  )
}
