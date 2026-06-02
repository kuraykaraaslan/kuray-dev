// Lighthouse CI — asserts the SEO + accessibility ceiling on the key public
// routes against a real production build (`next start`). Run with `npm run lhci`.
// Full pages need DB + Redis; in CI point `collect.url` at a seeded instance or a
// preview deployment (set LHCI_BASE_URL).
const BASE = process.env.LHCI_BASE_URL || 'http://localhost:3000'

module.exports = {
  ci: {
    collect: {
      startServerCommand: process.env.LHCI_BASE_URL ? undefined : 'npx next start -p 3000',
      startServerReadyPattern: 'Ready in|started server on|Local:',
      startServerReadyTimeout: 60000,
      url: [
        `${BASE}/`,
        `${BASE}/blog`,
        `${BASE}/projects`,
        `${BASE}/about`,
        `${BASE}/tr`, // localized home — verifies <html lang="tr"> in the server HTML
      ],
      numberOfRuns: 1,
      settings: {
        onlyCategories: ['seo', 'accessibility'],
        preset: 'desktop',
        // --no-sandbox is required for headless Chrome under WSL2 / most CI sandboxes.
        chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        // Individual SEO/a11y audits that must pass outright:
        'document-title': 'error',
        'meta-description': 'error',
        'http-status-code': 'error',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'hreflang': 'error',
        'canonical': 'error',
        'html-has-lang': 'error', // fails today (always "en"); passes after the proxy x-lang fix
        'html-lang-valid': 'error',
        'image-alt': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
