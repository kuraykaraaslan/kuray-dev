import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

const DICT_DIR = path.join(__dirname, '../dictionaries')

function readDict(lang: string): any {
  const file = path.join(DICT_DIR, `${lang}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

const EN_SECTIONS = [
  {
    id: 'homepage-welcome',
    type: 'HeroWelcomeLiveBlock',
    order: 0,
    props: {},
  },
  {
    id: 'homepage-toolbox',
    type: 'HeroToolboxLiveBlock',
    order: 1,
    props: {},
  },
  {
    id: 'homepage-projects',
    type: 'HeroProjectsLiveBlock',
    order: 2,
    props: {},
  },
  {
    id: 'homepage-contact',
    type: 'HeroContactLiveBlock',
    order: 3,
    props: { bgColor: '' },
  },
]

async function main() {
  const enDict = readDict('en')
  const enHome = enDict?.metadata?.home ?? {}

  const page = await prisma.dynamicPage.upsert({
    where: { slug: '' },
    update: {
      title: enHome.title ?? 'Kuray Karaaslan',
      description: enHome.description ?? '',
      keywords: enHome.keywords ?? [],
      status: 'PUBLISHED',
      sections: EN_SECTIONS as any,
    },
    create: {
      slug: '',
      title: enHome.title ?? 'Kuray Karaaslan',
      description: enHome.description ?? '',
      keywords: enHome.keywords ?? [],
      status: 'PUBLISHED',
      sections: EN_SECTIONS as any,
    },
  })

  console.log(`DynamicPage upserted: ${page.dynamicPageId} (slug: "${page.slug}")`)

  const langs = fs.readdirSync(DICT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .filter((l) => l !== 'en')

  for (const lang of langs) {
    const dict = readDict(lang)
    const home = dict?.metadata?.home ?? {}
    const title = home.title
    if (!title) {
      console.warn(`  Skipping ${lang}: no metadata.home.title`)
      continue
    }

    await prisma.dynamicPageTranslation.upsert({
      where: { dynamicPageId_lang: { dynamicPageId: page.dynamicPageId, lang } },
      update: {
        title,
        description: home.description ?? null,
        sections: EN_SECTIONS as any,
      },
      create: {
        dynamicPageId: page.dynamicPageId,
        lang,
        title,
        description: home.description ?? null,
        sections: EN_SECTIONS as any,
      },
    })

    console.log(`  Translation upserted: ${lang} — ${title.substring(0, 50)}`)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
