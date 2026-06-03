// Lighthouse CI — runs ALL categories (performance, accessibility, best-practices,
// SEO) on the key public routes against a real production build (`next start`).
// SEO + accessibility are hard gates (error); performance + best-practices are
// warn-only because they vary with the host machine and because the is-on-https
// audit dings localhost-over-http. Run with `npm run lhci`.
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
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        preset: 'desktop',
        // --no-sandbox is required for headless Chrome under WSL2 / most CI sandboxes.
        chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        // Collected for visibility but warn-only — perf is machine-dependent and
        // best-practices' is-on-https audit dings localhost-over-http:
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
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
