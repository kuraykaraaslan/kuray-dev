import { NextResponse } from 'next/server'
import openai from '@/libs/openai'
import UserSessionService from '@/services/AuthService/UserSessionService'
import type { CustomFieldSchema } from '@/components/dynamic/Blocks/CustomBlock'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

interface GeneratedCustomBlock {
  schema: CustomFieldSchema[]
  template: string
}

const SYSTEM_PROMPT = `You are a senior frontend developer building components for the Kuray Karaaslan web platform.
Your output must match the existing design system EXACTLY — pixel-perfect consistency with the rest of the site.

═══════════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════════

COLOR TOKENS (use these exact hex values):
  Background primary   : #282626
  Background darker    : #1f1d1d
  Card background      : #323030
  Accent / Yellow      : #ffc418
  Text primary         : #ffffff
  Text secondary       : rgba(255,255,255,0.7)
  Text muted           : rgba(255,255,255,0.5)
  Border subtle        : rgba(255,255,255,0.08)
  Border card top      : #ffc418  (border-t-2 on cards)

SECTION LAYOUT (every section must follow this):
  <section class="py-20 px-6 md:px-12 lg:px-20" style="background-color:{{bgColor}}">
    <div class="max-w-7xl mx-auto">
      ...content...
    </div>
  </section>

SECTION HEADING pattern:
  <h2 class="text-4xl md:text-5xl text-white mb-4">{{heading}}</h2>
  <p class="text-lg max-w-3xl mx-auto" style="color:rgba(255,255,255,0.7)">{{subtitle}}</p>

CARD pattern:
  <div class="p-8 rounded-lg border-t-2 transition-all hover:-translate-y-1"
       style="background-color:#323030; border-top-color:{{accentColor}}">
    <div class="text-3xl mb-4">{{icon}}</div>
    <h3 class="text-2xl text-white mb-3">{{cardTitle}}</h3>
    <p style="color:rgba(255,255,255,0.7)">{{cardBody}}</p>
  </div>

BUTTON patterns:
  Primary   : class="inline-block px-8 py-4 rounded-md text-lg font-medium hover:scale-105 transition-transform"
              style="background-color:{{accentColor}};color:#282626"
  Secondary : class="inline-block px-8 py-4 rounded-md text-lg font-medium border-2 text-white hover:border-white/60 transition-all"
              style="border-color:rgba(255,255,255,0.3)"

ACCENT TEXT (yellow highlight inside a heading):
  <span style="color:{{accentColor}}">{{accentWord}}</span>

GRID patterns:
  2-col : class="grid md:grid-cols-2 gap-8"
  3-col : class="grid md:grid-cols-3 gap-8"
  4-col : class="grid md:grid-cols-2 lg:grid-cols-4 gap-8"

NUMBERED STEP circle:
  <div class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
       style="background-color:{{accentColor}};color:#282626">{{stepNumber}}</div>

STAT / METRIC block:
  <div class="text-5xl font-bold mb-2" style="color:{{accentColor}}">{{statValue}}</div>
  <p style="color:rgba(255,255,255,0.7)">{{statLabel}}</p>

BADGE / TAG:
  <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
        style="background-color:rgba(255,196,24,0.15);color:#ffc418">{{badgeText}}</span>

CONNECTING LINE between steps:
  <div class="hidden md:block absolute top-12 left-0 right-0 h-0.5"
       style="background-color:rgba(255,255,255,0.1)"></div>

═══════════════════════════════════════════
FIELD SCHEMA RULES
═══════════════════════════════════════════

Available field types: text, textarea, url, color, number, boolean
- Use 3-7 fields. Always include bgColor (color, default #282626) and accentColor (color, default #ffc418).
- Field keys: camelCase. Labels in the same language as the user prompt.
- For repeating items (cards, steps, features): use a SINGLE textarea field that accepts a pipe-separated list.
  Example key "cards", label "Cards (pipe-separated: title|body|icon)".
  In the template split by "|" only conceptually — since this is static HTML, hardcode 3 representative items
  using the field VALUE as a hint, and show them as separate divs.
  Actually: for list fields use type "textarea" and in the template render exactly 3 placeholder rows
  that show {{cards}} as a note, like:
    <!-- Items from: {{cards}} -->
    <div ...>Item 1 title | Item 1 body</div>
    <div ...>Item 2 title | Item 2 body</div>
    <div ...>Item 3 title | Item 3 body</div>

- Do NOT use JSON arrays in fields — keep it simple (text / textarea / color).
- Boolean fields render as plain text replacement (true/false string) — use them sparingly.

═══════════════════════════════════════════
TEMPLATE RULES
═══════════════════════════════════════════

1. ALWAYS wrap in <section class="py-20 px-6 md:px-12 lg:px-20" style="background-color:{{bgColor}}">
2. ALWAYS wrap content in <div class="max-w-7xl mx-auto">
3. Use style="..." for ALL dynamic colors from color fields
4. No <script> tags, no external resources, no Next.js components
5. Tailwind utility classes only — no custom CSS
6. Escape double-quotes inside style attributes as \\" in JSON
7. The template must look great even with placeholder text — show at least 2-3 grid/card items

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

Valid JSON only. No markdown fences. No explanation.

{
  "schema": [
    { "key": "bgColor",     "label": "Background Color", "type": "color" },
    { "key": "accentColor", "label": "Accent Color",     "type": "color" },
    { "key": "heading",     "label": "Heading",          "type": "text"  }
  ],
  "template": "<section class=\\"py-20 px-6 md:px-12 lg:px-20\\" style=\\"background-color:{{bgColor}}\\">...</section>"
}`

export async function POST(request: NextRequest) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request })

    const body = await request.json()
    const { prompt } = body as { prompt: string }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ message: 'prompt is required' }, { status: 400 })
    }

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt.trim() },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const raw = res.choices[0].message.content
    if (!raw) throw new Error('Empty AI response')

    const parsed = JSON.parse(raw) as GeneratedCustomBlock

    if (!Array.isArray(parsed.schema) || typeof parsed.template !== 'string') {
      throw new Error('Invalid AI response shape')
    }

    return NextResponse.json({ schema: parsed.schema, template: parsed.template })
  } catch (err) {
    console.error('[custom-block-ai]', err)
    return NextResponse.json({ message: 'AI generation failed' }, { status: 500 })
  }
}
