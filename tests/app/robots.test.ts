import robots from '@/app/robots'
import { SITE_URL } from '@/libs/seo/siteUrl'

describe('app/robots', () => {
  it('disallows /admin/ and /api/, allows the root, and points to the sitemap', () => {
    const r = robots()
    const wildcard = (r.rules as any[]).find((x) => x.userAgent === '*')
    expect(wildcard).toBeDefined()
    expect(wildcard.allow).toBe('/')
    expect(wildcard.disallow).toEqual(expect.arrayContaining(['/admin/', '/api/']))
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`)
    expect(r.host).toBe(SITE_URL)
  })

  it('allow-lists the major AI / LLM crawlers', () => {
    const agents = (robots().rules as any[]).map((x) => x.userAgent)
    expect(agents).toEqual(
      expect.arrayContaining(['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'])
    )
  })
})
