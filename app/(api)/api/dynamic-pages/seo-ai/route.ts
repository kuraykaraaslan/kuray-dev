import { NextResponse } from 'next/server'
import openai from '@/libs/openai'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

const SYSTEM_PROMPT = `You are an SEO expert. Given a page title and its content blocks, generate concise and effective SEO metadata.

Return ONLY valid JSON with this exact shape:
{
  "description": "Meta description (max 160 chars, compelling summary for search engines)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "ogTitle": "Open Graph title (max 60 chars, catchy for social sharing)",
  "ogDescription": "OG description (max 200 chars, engaging for social media preview)",
  "twitterTitle": "Twitter card title (max 70 chars)",
  "twitterDescription": "Twitter card description (max 200 chars)"
}

Rules:
- description: 120-160 characters, include main keyword naturally
- keywords: 4-8 relevant keywords/phrases, ordered by importance
- ogTitle: Can be slightly different/catchier than page title
- All fields must be non-empty strings
- No markdown, no extra explanation, JSON only`

function extractTextFromSections(sections: Array<{ type: string; props: Record<string, unknown> }>): string {
  const parts: string[] = []

  for (const section of sections) {
    parts.push(`[${section.type} block]`)
    for (const [key, val] of Object.entries(section.props)) {
      if (typeof val === 'string' && val.trim() && !val.startsWith('http') && !val.startsWith('#')) {
        parts.push(`${key}: ${val.trim()}`)
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'object' && item !== null) {
            for (const v of Object.values(item as Record<string, unknown>)) {
              if (typeof v === 'string' && v.trim()) parts.push(v.trim())
            }
          } else if (typeof item === 'string' && item.trim()) {
            parts.push(item.trim())
          }
        }
      }
    }
  }

  return parts.join('\n').slice(0, 3000)
}

export async function POST(request: NextRequest) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request })

    const body = await request.json()
    const { title, sections } = body as {
      title: string
      sections: Array<{ type: string; props: Record<string, unknown> }>
    }

    if (!title || !Array.isArray(sections)) {
      return NextResponse.json({ message: 'title and sections are required' }, { status: 400 })
    }

    const contentSummary = extractTextFromSections(sections)
    const userPrompt = `Page title: ${title}\n\nPage content:\n${contentSummary}`

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 600,
    })

    const raw = res.choices[0].message.content
    if (!raw) throw new Error('Empty AI response')

    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[seo-ai]', err)
    return NextResponse.json({ message: 'SEO generation failed' }, { status: 500 })
  }
}
