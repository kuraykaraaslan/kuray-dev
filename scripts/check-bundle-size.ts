/**
 * Bundle-size CI gate.
 *
 * Reads all .js files under .next/static/chunks/ and compares the total against
 * a stored baseline. Fails if growth exceeds the allowed thresholds:
 *   - total JS > 5 % growth → error
 *
 * Run AFTER `next build`. On first run (no baseline) it writes the baseline
 * and exits 0. To reset the baseline, delete scripts/bundle-baseline.json.
 *
 * Usage: tsx scripts/check-bundle-size.ts
 */

import fs from 'fs'
import path from 'path'

const CHUNKS_DIR = path.join(process.cwd(), '.next', 'static', 'chunks')
const BASELINE_FILE = path.join(process.cwd(), 'scripts', 'bundle-baseline.json')

// % growth allowed before the gate fails
const MAX_TOTAL_GROWTH_PCT = 5

interface Baseline {
  totalBytes: number
  measuredAt: string
}

function sumJsBytes(dir: string): number {
  if (!fs.existsSync(dir)) return 0
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    .reduce((sum, f) => sum + fs.statSync(path.join(dir, f)).size, 0)
}

function fmt(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function main() {
  const currentBytes = sumJsBytes(CHUNKS_DIR)
  console.log(`Current bundle size: ${fmt(currentBytes)} (${currentBytes} bytes)`)

  if (!fs.existsSync(BASELINE_FILE)) {
    const baseline: Baseline = { totalBytes: currentBytes, measuredAt: new Date().toISOString() }
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + '\n')
    console.log(`Baseline written to ${BASELINE_FILE} — run again after a code change to check growth.`)
    process.exit(0)
  }

  const baseline: Baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'))
  const diff = currentBytes - baseline.totalBytes
  const pct = baseline.totalBytes > 0 ? (diff / baseline.totalBytes) * 100 : 0

  console.log(`Baseline:  ${fmt(baseline.totalBytes)} (measured ${baseline.measuredAt})`)
  console.log(`Diff:      ${diff >= 0 ? '+' : ''}${fmt(diff)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`)

  if (pct > MAX_TOTAL_GROWTH_PCT) {
    console.error(
      `\n✗ Bundle grew ${pct.toFixed(2)}% (limit ${MAX_TOTAL_GROWTH_PCT}%). ` +
        `Investigate with ANALYZE=true npm run build before merging.`
    )
    process.exit(1)
  }

  if (diff > 0) {
    console.log(`\n⚠ Bundle grew ${pct.toFixed(2)}% — within ${MAX_TOTAL_GROWTH_PCT}% limit.`)
  } else if (diff < 0) {
    console.log(`\n✓ Bundle shrank ${Math.abs(pct).toFixed(2)}% — good.`)
  } else {
    console.log(`\n✓ No bundle size change.`)
  }
}

main()
