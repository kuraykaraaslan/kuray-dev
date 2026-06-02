import MetadataHelper from '@/helpers/MetadataHelper'

// Validates the pure JSON-LD generators (object-returning) — NOT the JSX-returning
// generateJsonLdScripts/generateElements. Each schema must carry a valid
// schema.org @context + @type and its required rich-result fields.

const expectSchema = (o: Record<string, unknown>, type: string) => {
  expect(o['@context']).toBe('https://schema.org')
  expect(o['@type']).toBe(type)
}

describe('MetadataHelper JSON-LD generators', () => {
  it('getWebSiteJsonLd / getOrganizationJsonLd / getProfilePageJsonLd are well-formed', () => {
    expectSchema(MetadataHelper.getWebSiteJsonLd(), 'WebSite')
    expectSchema(MetadataHelper.getOrganizationJsonLd(), 'Organization')
    expectSchema(MetadataHelper.getProfilePageJsonLd(), 'ProfilePage')
  })

  it('getBlogPostingJsonLd carries the required BlogPosting fields', () => {
    const ld = MetadataHelper.getBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://example.com/blog/c/p',
      image: 'https://example.com/i.png',
      datePublished: '2024-01-01T00:00:00Z',
    }) as Record<string, any>
    expectSchema(ld, 'BlogPosting')
    expect(ld.headline).toBe('T')
    expect(ld.author['@type']).toBe('Person')
    expect(ld.publisher.logo['@type']).toBe('ImageObject')
    // dateModified falls back to datePublished when omitted
    expect(ld.dateModified).toBe('2024-01-01T00:00:00Z')
  })

  it('getSoftwareApplicationJsonLd is valid and defaults the image', () => {
    const ld = MetadataHelper.getSoftwareApplicationJsonLd({
      name: 'N',
      description: 'D',
      url: 'https://example.com/projects/x',
    }) as Record<string, any>
    expectSchema(ld, 'SoftwareApplication')
    expect(typeof ld.image).toBe('string')
    expect(ld.image.length).toBeGreaterThan(0)
  })

  it('getBreadcrumbJsonLd positions are 1-indexed and contiguous', () => {
    const ld = MetadataHelper.getBreadcrumbJsonLd([
      { name: 'Home', url: 'u1' },
      { name: 'Blog', url: 'u2' },
      { name: 'Post', url: 'u3' },
    ]) as Record<string, any>
    expectSchema(ld, 'BreadcrumbList')
    expect(ld.itemListElement.map((i: any) => i.position)).toEqual([1, 2, 3])
  })

  it('getPersonProfilePageJsonLd describes the given author (not the site owner)', () => {
    const ld = MetadataHelper.getPersonProfilePageJsonLd({
      name: 'Ada Lovelace',
      url: 'https://example.com/users/ada',
      description: 'Mathematician',
    }) as Record<string, any>
    expectSchema(ld, 'ProfilePage')
    expect(ld.mainEntity['@type']).toBe('Person')
    expect(ld.mainEntity.name).toBe('Ada Lovelace')
    expect(ld.mainEntity['@id']).toBe('https://example.com/users/ada#person')
  })

  it('getCollectionPageJsonLd lists its posts as BlogPosting parts', () => {
    const ld = MetadataHelper.getCollectionPageJsonLd({
      url: 'https://example.com/projects',
      name: 'Projects',
      description: 'All projects',
      posts: [{ title: 'A', url: 'https://example.com/projects/a' }],
    }) as Record<string, any>
    expectSchema(ld, 'CollectionPage')
    expect(ld.hasPart[0]['@type']).toBe('BlogPosting')
    expect(ld.hasPart[0].headline).toBe('A')
  })

  it('getPortfolioItemListJsonLd 1-indexes items and returns null when empty', () => {
    expect(MetadataHelper.getPortfolioItemListJsonLd([])).toBeNull()
    const ld = MetadataHelper.getPortfolioItemListJsonLd([
      { name: 'P1', url: 'https://example.com/projects/p1' },
    ]) as Record<string, any>
    expectSchema(ld, 'ItemList')
    expect(ld.itemListElement[0].position).toBe(1)
  })

  it('getArticleJsonLd only emits for /blog/ URLs (no false Article on other pages)', () => {
    expect(
      MetadataHelper.getArticleJsonLd({ openGraph: { url: 'https://example.com/projects/x' } } as any)
    ).toBeNull()
    const article = MetadataHelper.getArticleJsonLd({
      title: 'T',
      description: 'D',
      openGraph: { url: 'https://example.com/blog/c/p' },
    } as any) as Record<string, any>
    expectSchema(article, 'Article')
  })
})
