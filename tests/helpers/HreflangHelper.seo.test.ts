import { buildAlternates, normalizeLangs, robotsFor } from '@/helpers/HreflangHelper'

// Complements HreflangHelper.test.ts with the SEO invariants that must never
// regress: no /undefined hreflang, x-default === en, indexability gating.
// Host is captured at import time (jest.setup sets NEXT_PUBLIC_APPLICATION_HOST),
// so we assert on path structure + URL validity, not an exact origin.

describe('HreflangHelper — SEO invariants', () => {
  describe('normalizeLangs', () => {
    it('always includes the default language', () => {
      expect(normalizeLangs([])).toContain('en')
    })

    it('drops null/empty/invalid codes so no /undefined hreflang can be produced', () => {
      const out = normalizeLangs(['tr', '', null as unknown as string, undefined as unknown as string, 'zz'])
      expect(out).toEqual(expect.arrayContaining(['en', 'tr']))
      expect(out).not.toContain('')
      expect(out).not.toContain('zz')
      expect(out.some((l) => !l)).toBe(false)
    })

    it('dedupes repeated codes', () => {
      const out = normalizeLangs(['tr', 'tr', 'en'])
      expect(out.filter((l) => l === 'tr')).toHaveLength(1)
      expect(out.filter((l) => l === 'en')).toHaveLength(1)
    })
  })

  describe('buildAlternates', () => {
    it('produces only valid absolute URLs with no /undefined segment', () => {
      const { canonical, languages } = buildAlternates('tr', '/blog/c/p', [
        'en',
        'tr',
        '' as unknown as string,
      ])
      for (const url of [canonical, ...Object.values(languages)]) {
        expect(url).not.toMatch(/\/undefined(\/|$)/)
        expect(() => new URL(url)).not.toThrow()
      }
    })

    it('x-default points to the English version', () => {
      const { languages } = buildAlternates('tr', '/about', ['en', 'tr'])
      expect(languages['x-default']).toBe(languages['en'])
    })

    it('canonical is self-referential for the requested language', () => {
      const { canonical } = buildAlternates('tr', '/about', ['en', 'tr'])
      expect(canonical).toContain('/tr/about')
      const { canonical: enCanonical } = buildAlternates('en', '/about', ['en', 'tr'])
      expect(enCanonical).not.toMatch(/\/en\//)
      expect(enCanonical).toContain('/about')
    })
  })

  describe('robotsFor', () => {
    it('indexes when the language is genuinely available', () => {
      expect(robotsFor(true)).toMatchObject({ index: true, googleBot: { index: true } })
    })

    it('noindexes untranslated languages but keeps follow=true (preserve link equity)', () => {
      const r = robotsFor(false)
      expect(r).toMatchObject({ index: false, googleBot: { index: false } })
      expect(r.follow).toBe(true)
    })
  })
})
