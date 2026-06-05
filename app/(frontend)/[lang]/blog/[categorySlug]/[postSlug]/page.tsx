import Article from '@/components/frontend/Features/Blog/Article'
import PostService from '@/services/PostService'
import CommentService from '@/services/CommentService'
import PostLikeService from '@/services/PostService/LikeService'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Comments from '@/components/frontend/Features/Blog/Comments'
import OtherPosts from '@/components/frontend/Features/Blog/OtherPosts'
import Newsletter from '@/components/frontend/Features/Newsletter'
import PostHeader from '@/components/frontend/Features/Blog/PostHeader'
import LiveViewerCount from '@/components/frontend/UI/LiveViewerCount'
import PostViewBeacon from '@/components/frontend/Features/Blog/PostViewBeacon'
import MetadataHelper from '@/helpers/MetadataHelper'
import ShareButtons from '@/components/frontend/Features/Blog/ShareButtons'
import TableOfContents from '@/components/frontend/Features/Blog/TableOfContents'
import Breadcrumb from '@/components/common/Layout/Breadcrumb'
import { buildAlternates, getOgLocale, robotsFor } from '@/helpers/HreflangHelper'
import SeriesNav from '@/components/frontend/Features/Blog/SeriesNav'
import redisInstance from '@/libs/redis'
import { PostWithData, PostWithDataSchema } from '@/types/content/BlogTypes'
import { SITE_URL } from '@/libs/seo/siteUrl'

const NEXT_PUBLIC_APPLICATION_HOST = SITE_URL
const FRONTEND_CACHE_TTL = 60 // Cache for 60 seconds
const FRONTEND_CACHE_KEY_PREFIX = 'frontend:blogpost:'

/** Plain-text excerpt for meta/OG descriptions — strips HTML tags and collapses whitespace. */
function toPlainExcerpt(html: string, max = 160): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, max)
}

type Props = {
  params: Promise<{ lang: string; categorySlug: string; postSlug: string }>
}

// Fetch post data for both metadata and page rendering
async function getPost(postSlug: string, lang: string) {
  const post_cacheKey = `${FRONTEND_CACHE_KEY_PREFIX}:${postSlug}:${lang}`
  try {
    const cached = await redisInstance.get(post_cacheKey)
    if (cached) {
      const parsed = PostWithDataSchema.safeParse(JSON.parse(cached))
      if (parsed.success) {
        return parsed.data as PostWithData
      }

      // Self-heal stale cache payloads from older schema versions.
      await redisInstance.del(post_cacheKey)
    }
  } catch (error) {
    console.error('Error fetching post from Redis cache:', error)
  }
  const response = await PostService.getAllPosts({
    page: 0,
    pageSize: 1,
    slug: postSlug,
    status: 'ALL',
    lang,
  })

  //cache
  if (response.posts[0]) {
    await redisInstance.set(post_cacheKey, JSON.stringify(response.posts[0]), 'EX', FRONTEND_CACHE_TTL)
  }

  return response.posts[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug, categorySlug, lang } = await params
  const post = await getPost(postSlug, lang)

  if (!post || post.status !== 'PUBLISHED') {
    return {}
  }

  const path = `/blog/${categorySlug}/${postSlug}`
  const image = post.image || `${NEXT_PUBLIC_APPLICATION_HOST}/blog/${categorySlug}/${postSlug}/opengraph-image`
  const description = post.description || toPlainExcerpt(post.content)

  const availableLangs = ['en', ...(post.translations?.map((t) => t.lang) ?? [])]
  const { canonical, languages, indexableLangs } = buildAlternates(lang, path, availableLangs)
  // Only index this language if the post is actually translated to it
  // (post is guaranteed PUBLISHED here — non-published returns {} above).
  const indexable = indexableLangs.includes(lang)

  return {
    // bare title — layout's "%s | Kuray Karaaslan" template adds the suffix
    title: post.title,
    description,
    keywords: post.keywords?.length ? post.keywords : [post.category.title],
    robots: robotsFor(indexable),
    authors: [{ name: 'Kuray Karaaslan', url: `${NEXT_PUBLIC_APPLICATION_HOST}/about` }],
    openGraph: {
      title: `${post.title} | Kuray Karaaslan`,
      description,
      type: 'article',
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      locale: getOgLocale(lang),
      siteName: 'Kuray Karaaslan',
      publishedTime: post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: ['Kuray Karaaslan'],
      section: post.category.title,
      tags: post.keywords?.length ? post.keywords : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kuraykaraaslan',
      creator: '@kuraykaraaslan',
      title: post.title,
      description,
      images: [image],
    },
    alternates: { canonical, languages },
    other: availableLangs.length > 1
      ? { 'og:locale:alternate': availableLangs.filter((l) => l !== lang).map((l) => getOgLocale(l)) }
      : undefined,
  }
}

export default async function BlogPost({ params }: Props) {
  try {
    const { postSlug, categorySlug, lang } = await params

    if (!postSlug || !categorySlug) {
      notFound()
    }

    const post = await getPost(postSlug, lang)

    if (!post) {
      notFound()
    }

    if (post.status !== 'PUBLISHED') {
      notFound()
    }

    // View counting runs client-side via <PostViewBeacon> (see JSX below) — it
    // tracks real page loads (not bot/prefetch HTML fetches) and keeps this render
    // free of side effects.

    const url = `${NEXT_PUBLIC_APPLICATION_HOST}/blog/${post.category.slug}/${post.slug}`
    const image =
      post.image || `${NEXT_PUBLIC_APPLICATION_HOST}/blog/${categorySlug}/${postSlug}/opengraph-image`

    // Metadata for JSON-LD
    const metadata: Metadata = {
      title: `${post.title} | Kuray Karaaslan`,
      description: post.description || toPlainExcerpt(post.content),
      openGraph: {
        title: `${post.title} | Kuray Karaaslan`,
        description: post.description || toPlainExcerpt(post.content),
        type: 'article',
        url,
        images: [image],
      },
    }

    // Breadcrumbs for SEO
    const breadcrumbs = [
      { name: 'Home', url: `${NEXT_PUBLIC_APPLICATION_HOST}/` },
      { name: 'Blog', url: `${NEXT_PUBLIC_APPLICATION_HOST}/blog` },
      { name: post.category.title, url: `${NEXT_PUBLIC_APPLICATION_HOST}/blog/${post.category.slug}` },
      { name: post.title, url },
    ]

    // Strip HTML tags for articleBody (plain text for SEO)
    const articleBody = post.content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000) // Limit to 5000 chars to avoid huge schemas

    // Article data for JSON-LD
    const articleData = {
      datePublished: post.createdAt?.toISOString(),
      dateModified: post.updatedAt?.toISOString() || post.createdAt?.toISOString(),
      authorName: 'Kuray Karaaslan',
      articleSection: post.category.title,
      keywords: post.keywords?.length ? post.keywords : [post.category.title],
      wordCount: post.content.split(/\s+/).length,
      articleBody,
      commentCount: 0, // Will be updated below
      relatedLinks: [] as string[], // Will be updated below
    }

    // Fetch related posts for schema (same category, exclude current post)
    let relatedLinks: string[] = []
    try {
      const relatedResponse = await PostService.getAllPosts({
        page: 0,
        pageSize: 6,
        categoryId: post.categoryId,
        status: 'PUBLISHED',
        lang,
      })
      const relatedPosts = relatedResponse.posts
        .filter((p) => p.postId !== post.postId)
        .slice(0, 5)
      relatedLinks = relatedPosts.map((p) => `${NEXT_PUBLIC_APPLICATION_HOST}/blog/${p.category.slug}/${p.slug}`)
      articleData.relatedLinks = relatedLinks
    } catch (error) {
      console.error('Error fetching related posts for schema:', error)
    }

    // Fetch comments for schema (server-side)
    let commentsForSchema: {
      commentId: string
      content: string
      createdAt: Date | string
      name: string | null
    }[] = []
    try {
      const commentsResponse = await CommentService.getAllComments({
        page: 0,
        pageSize: 50, // Limit to 50 comments for schema
        postId: post.postId,
      })
      commentsForSchema = commentsResponse.comments.map((c) => ({
        commentId: c.commentId,
        content: c.content,
        createdAt: c.createdAt,
        name: c.name,
      }))
      articleData.commentCount = commentsResponse.total
    } catch (error) {
      console.error('Error fetching comments for schema:', error)
    }

    // Fetch like count for AggregateRating schema
    let likeCount = 0
    try {
      likeCount = await PostLikeService.countLikes(post.postId)
    } catch (error) {
      console.error('Error fetching like count for schema:', error)
    }

    // NewsArticle schema for posts published within the last 48 hours
    const publishedAt = post.createdAt ? new Date(post.createdAt).getTime() : 0
    const isNewsArticle = publishedAt > 0 && Date.now() - publishedAt < 48 * 60 * 60 * 1000

    return (
      <>
        {MetadataHelper.generateJsonLdScripts(metadata, {
          articleData,
          breadcrumbs,
          comments: commentsForSchema,
          rating: likeCount > 0 ? { likeCount } : undefined,
          isNewsArticle,
          blogPosting: {
            title: post.title,
            description: post.description || toPlainExcerpt(post.content),
            url,
            image,
            datePublished: post.createdAt?.toISOString() || new Date().toISOString(),
            dateModified: post.updatedAt?.toISOString() || post.createdAt?.toISOString(),
            authorName: 'Kuray Karaaslan',
            wordCount: articleData.wordCount,
            keywords: articleData.keywords,
            articleSection: post.category.title,
          },
        })}
        {relatedLinks.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Related Articles',
                itemListElement: relatedLinks.map((href, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: href,
                })),
              }),
            }}
          />
        )}
        <PostViewBeacon postId={post.postId} />
        <section className="min-h-screen bg-base-100 pt-32" id="blog">
          <div className="container mx-auto px-4 lg:px-8 mb-8 flex-grow flex-col max-w-7xl">
            <Breadcrumb items={breadcrumbs} />
            <PostHeader {...post}>
              <LiveViewerCount slug={post.slug} />
            </PostHeader>
            {post.seriesEntry && (
              <SeriesNav seriesRef={post.seriesEntry} currentPostId={post.postId} />
            )}
            <TableOfContents content={post.content} />
            <Article title={post.title} content={post.content} image={image || post.image || `/api/posts/${post.postId}/cover.jpeg`} />
            <ShareButtons title={post.title} url={url} postId={post.postId} lang={lang} />
            <OtherPosts postId={post.postId} />
            <Comments postId={post.postId} />
          </div>
        </section>
        <Newsletter />
      </>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}
