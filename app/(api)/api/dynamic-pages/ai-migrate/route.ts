import { NextResponse } from 'next/server'
import openai from '@/libs/openai'
import { BlockDataSchema } from '@/types/content/PageTypes'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

const SYSTEM_PROMPT = `You are a data migration assistant for a dynamic page builder.

Current block schema (each block must conform to this):
{
  "id": "string — unique identifier",
  "type": "string — block type name (e.g. HeroBlock, TextBlock, ImageBlock)",
  "order": "number — 0-indexed position",
  "props": "object — all block-specific content fields",
  "hidden": "boolean (optional)",
  "label": "string (optional)",
  "className": "string (optional)"
}

Migration rules:
1. Every block MUST have: id, type, order, props
2. If 'id' is missing or invalid, generate one like "block-{index}"
3. Infer 'type' from existing keys like 'blockType', 'component', 'name', or the structure
4. Set 'order' as sequential index (0, 1, 2, ...)
5. Wrap all content fields into 'props' if they are not already there
6. If a block is clearly a hero section, use type "HeroBlock"; text content → "TextBlock"; images → "ImageBlock"; etc.
7. Keep existing valid props as-is inside the props object
8. Return ONLY a valid JSON array of migrated blocks — no explanation, no markdown, no code fences`

export async function POST(request: NextRequest) {
  await AuthMiddleware.authenticateUserByRequest({ request })

  try {
    const body = await request.json()
    const { sections } = body as { sections: unknown[] }

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: 'sections must be an array' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Migrate these blocks to the current schema:\n\n${JSON.stringify(sections, null, 2)}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]'
    let migrated: unknown[]
    try {
      migrated = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 502 })
    }

    if (!Array.isArray(migrated)) {
      return NextResponse.json({ error: 'AI returned non-array result' }, { status: 502 })
    }

    // Validate each migrated block
    const validated = migrated.map((block, i) => {
      const result = BlockDataSchema.safeParse(block)
      if (result.success) return result.data
      // Fallback: ensure minimum required fields
      const b = block as Record<string, unknown>
      return BlockDataSchema.parse({
        id: String(b.id ?? `migrated-${i}`),
        type: String(b.type ?? 'UnknownBlock'),
        order: typeof b.order === 'number' ? b.order : i,
        props: (b.props && typeof b.props === 'object') ? b.props : {},
        hidden: typeof b.hidden === 'boolean' ? b.hidden : undefined,
        label: typeof b.label === 'string' ? b.label : undefined,
        className: typeof b.className === 'string' ? b.className : undefined,
      })
    })

    return NextResponse.json({ sections: validated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
