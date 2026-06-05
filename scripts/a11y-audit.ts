/**
 * axe-core a11y audit — runs axe against key public routes via headless Chrome
 * and fails (exit 1) on any critical or serious violations.
 *
 * Relies on the same Chrome binary that Lighthouse CI downloads.
 * Usage: AUDIT_BASE_URL=http://localhost:3000 tsx scripts/a11y-audit.ts
 */

import { execSync } from 'child_process'

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3000'

const ROUTES = ['/', '/blog', '/projects', '/about', '/tr']

// Same Chrome resolution as the lhci npm script
function resolveChrome(): string | undefined {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  try {
    const result = execSync(
      "ls -d $HOME/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1",
      { encoding: 'utf8', shell: '/bin/bash' }
    ).trim()
    return result || undefined
  } catch {
    return undefined
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runAxe(page: any, url: string): Promise<{ violations: any[] }> {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
  // Inject axe-core from node_modules then run it
  const axePath = require.resolve('axe-core')
  await page.addScriptTag({ path: axePath })
  return page.evaluate(() => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'best-practice'] }, (_: unknown, results: { violations: unknown[] }) => {
        resolve(results)
      })
    })
  })
}

async function main() {
  // Dynamic import so puppeteer-core is not resolved at parse time (it may be a CJS module)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const puppeteer = require('puppeteer-core')

  const chromePath = resolveChrome()
  if (!chromePath) {
    console.error('Could not locate Chrome. Set CHROME_PATH or run Lighthouse CI once first.')
    process.exit(1)
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true,
  })

  let failed = false

  try {
    for (const route of ROUTES) {
      const url = `${BASE}${route}`
      const page = await browser.newPage()
      try {
        const { violations } = await runAxe(page, url)

        const serious = violations.filter((v: { impact: string }) =>
          v.impact === 'critical' || v.impact === 'serious'
        )
        const minor = violations.filter((v: { impact: string }) =>
          v.impact !== 'critical' && v.impact !== 'serious'
        )

        if (serious.length > 0) {
          console.error(`\n  ✗ ${route}  (${serious.length} critical/serious violation${serious.length > 1 ? 's' : ''})`)
          for (const v of serious) {
            console.error(`    [${v.impact}] ${v.id}: ${v.description}`)
            for (const node of v.nodes.slice(0, 2)) {
              console.error(`      → ${node.html?.slice(0, 120)}`)
            }
          }
          failed = true
        } else {
          const warn = minor.length > 0 ? ` (${minor.length} minor)` : ''
          console.log(`  ✓ ${route}${warn}`)
        }
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }

  if (failed) {
    console.error('\na11y audit FAILED')
    process.exit(1)
  }
  console.log('\na11y audit passed ✓')
}

main()
