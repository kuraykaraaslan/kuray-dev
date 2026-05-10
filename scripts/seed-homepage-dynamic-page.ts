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

const DEFAULT_CATEGORIES = [
  {
    label: 'Frontend',
    tools: [
      { name: 'React', icon: '⚛️', description: 'UI library' },
      { name: 'Next.js', icon: '▲', description: 'Full-stack framework' },
      { name: 'TypeScript', icon: 'TS', description: 'Type-safe JavaScript' },
      { name: 'Tailwind CSS', icon: '🌊', description: 'Utility-first CSS' },
    ],
  },
  {
    label: 'Backend',
    tools: [
      { name: 'Node.js', icon: '🟢', description: 'JavaScript runtime' },
      { name: 'PostgreSQL', icon: '🐘', description: 'Relational database' },
      { name: 'Redis', icon: '🔴', description: 'In-memory cache' },
      { name: 'Prisma', icon: '◆', description: 'ORM' },
    ],
  },
  {
    label: 'DevOps',
    tools: [
      { name: 'Docker', icon: '🐋', description: 'Containerization' },
      { name: 'AWS', icon: '☁️', description: 'Cloud platform' },
      { name: 'GitHub', icon: '🐙', description: 'Version control' },
      { name: 'Linux', icon: '🐧', description: 'Server OS' },
    ],
  },
]

const EN_SECTIONS = [
  {
    id: 'homepage-welcome',
    type: 'FrontendWelcomeBlock',
    order: 0,
    props: {
      greeting: 'Hi, I am',
      name: 'Kuray Karaaslan',
      title: 'Full-Stack Developer',
      description: 'I design and build modern, scalable web applications. Available for freelance projects worldwide.',
      ctaLabel: 'Contact Me',
      ctaHref: '#contact',
      secondaryLabel: 'View Projects',
      secondaryHref: '#projects',
      avatarUrl: '',
      bgColor: '',
    },
  },
  {
    id: 'homepage-toolbox',
    type: 'FrontendToolboxBlock',
    order: 1,
    props: {
      heading: 'My Toolbox',
      description: 'Technologies I work with regularly.',
      bgColor: '',
      categories: JSON.stringify(DEFAULT_CATEGORIES),
    },
  },
  {
    id: 'homepage-projects',
    type: 'FrontendProjectsBlock',
    order: 2,
    props: {
      heading: 'My Projects',
      description: 'A selection of recent work.',
      ctaLabel: 'View All Projects',
      ctaHref: '/projects',
      pageSize: 6,
      bgColor: '',
    },
  },
  {
    id: 'homepage-contact',
    type: 'ContactMethodsBlock',
    order: 3,
    props: {
      heading: 'Get in Touch',
      subtitle: 'I am available for freelance projects and collaborations.',
      bgColor: '',
      cardBgColor: '',
      accentColor: '',
      methods: JSON.stringify([
        { label: 'Email', value: 'kuraykaraaslan@gmail.com', href: 'mailto:kuraykaraaslan@gmail.com' },
        { label: 'LinkedIn', value: 'linkedin.com/in/kuraykaraaslan', href: 'https://linkedin.com/in/kuraykaraaslan' },
        { label: 'GitHub', value: 'github.com/kuraykaraaslan', href: 'https://github.com/kuraykaraaslan' },
      ]),
    },
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
