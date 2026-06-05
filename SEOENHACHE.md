# kuray.dev — Exhaustive SEO & Performance Improvement Plan (137 items)

## Context

The site already has a **strong** SEO foundation from the May–June 2026 overhaul: Lighthouse **SEO = 1.00** and **Accessibility = 1.00** on the 5 audited routes, per-page hreflang via [HreflangHelper.ts](helpers/HreflangHelper.ts), a single canonical Redis-cached sitemap, a Next-metadata-route robots.txt with AI-crawler allowlists, ~15 JSON-LD schema generators in [MetadataHelper.tsx](helpers/MetadataHelper.tsx), PWA manifest + service worker, security headers + HSTS preload, `next/font` Inter, AVIF/WebP image config, `modularizeImports`/`optimizePackageImports`, and a `web-vitals` → GA4 RUM reporter.

This plan targets the **remaining gaps and forgotten best-cases** that move the site from "SEO-perfect on a lab audit" to "maximally optimized in the field" — the levers Lighthouse's lab run doesn't gate (TTFB/Core Web Vitals under real load), the structured-data/social/i18n long tail, security hardening (the `best-practices` category is currently warn-only), and the tooling to keep it all from regressing.

A 21-dimension, read-only multi-agent audit produced **207 raw findings**, deduped/synthesized into **137 actionable items** across 13 themes. Each was file-verified. The headline P0/P1 claims were independently spot-checked (og.png is really 1280×769 not the declared 1200×630; `backend.jpg`=3.1MB, `web.jpg`=3.3MB; two huge unused GIFs total 10.9MB; `llm.txt` contains `http://localhost:3000`; GA + WebVitals load with **no** consent check; site-wide CSP exists only on `/sw.js`; deprecated `X-XSS-Protection` and `layout=fill`/`objectFit` still present; CORS falls back to `'*'`).

**Two user decisions baked in:** (1) the three high-risk architectural levers (edge-caching dynamic SSR, streaming root-layout refactor, full CSP+nonce) are **included** but flagged ⚠️ **HIGH-RISK** with verification steps — the team previously chose to keep dynamic-SSR-everywhere, so these need validation before merge; (2) GoogleAnalytics + WebVitals **will be consent-gated** (GDPR/KVKK).

**Goal:** ship the safe quick-wins immediately, then the high-impact caching/CWV/security work, while preserving every existing strength. Targeting Core Web Vitals all-green in CrUX field data and a hardened `best-practices` score, not just a green lab SEO score.

---

## Execution roadmap (suggested waves)

> Organize delivery by impact, not by theme. Each wave is a shippable batch.

- **Wave 0 — Quick wins (P0/P1, effort S):** items #4, #18, #20, #21, #23, #24, #25, #30, #35, #36, #50, #51, #52, #53, #62, #63, #70, #74, #80, #87, #88, #100, #104, #105, #117, #120, #122, #128. Mostly 1–2 line fixes, high ratio of impact to risk.
- **Wave 1 — Caching, CWV & images (biggest field-perf lever):** #1⚠️, #2, #3, #7, #8, #9, #11, #12, #19, #22, #26, #43, #45, #109, #112.
- **Wave 2 — Security & compliance:** #98⚠️, #99, #101, #102, #103⚠️, #106, #108, #133.
- **Wave 3 — Structured data, social, i18n, AI/LLM:** #49, #54, #55, #56+#57, #58, #59, #64, #65, #73, #76, #81, #82, #84, #93, #96, #97.
- **Wave 4 — Streaming refactor (⚠️ schedule last, highest regression risk):** #5⚠️.
- **Wave 5 — Tooling, monitoring & long-tail polish:** #129–#137 + remaining P3 items.

---

## Theme 1 — Caching, Dynamic-SSR & Core Web Vitals  *(biggest TTFB/CWV lever)*

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 1 ⚠️ | P0 | M | **Add `Vary: x-lang` + `Cache-Control: s-maxage, stale-while-revalidate` to frontend HTML** so the CDN caches per-language variants | next.config.mjs, proxy.ts, (frontend) pages | Force-dynamic pages emit no Vary/Cache-Control → CDN collapses languages & crawlers can get wrong-lang snapshots; edge cache cuts TTFB ~300–600ms. **Verify with `curl -I` per lang after deploy.** |
| 2 | P0 | M | **Identify & optimize the real LCP element** on `/`, `/blog`, post (priority/fetchPriority=high, <200KB) | layout.tsx, MyImageVideo.tsx, FeedCardImage.tsx | LCP is the dominant CWV ranking factor; no documented LCP strategy today |
| 3 | P1 | M | **Cache-tag (`revalidateTag`) invalidation** for content + sitemap/feed; purge Redis keys on PATCH/PUT/DELETE | api/posts/[postId], api/projects, post page | Time-only 60s TTL serves stale content/SEO snapshots; tags make edits live in seconds. *(Do after #1.)* |
| 4 | P1 | S | **Cache-Control on robots.txt + sitemap.xml** routes | robots.ts, sitemap.ts | Crawlers hit these every crawl; 1h cache cuts origin sitemap requests ~95% |
| 5 ⚠️ | P1 | L | **Stream root layout** — move lang/theme detection out of the sync critical path, add Suspense | layout.tsx, proxy.ts | Every page blocks HTML on `cookies()`+`headers()`; streaming cuts TTFB 300–600ms. **Highest regression risk — schedule last, validate hydration.** |
| 6 | P1 | M | **Suspense + dimension-matched skeletons** for `ssr:false` UI (theme/lang/search buttons, admin layout) | Navbar, (frontend)/layout, (admin)/layout | Unhydrated buttons cause 0.5–2s INP & white flash; matched skeletons cut perceived latency + prevent CLS |
| 7 | P1 | M | **Inject width/height + `loading=lazy` into sanitized rich-text `<img>`/SVG** | Blog/Article/index.tsx | User-uploaded inline images lack dims → leading CLS cause; can move CLS ~0.25 → <0.05 |
| 8 | P1 | M | **Replace JS `setTimeout` typing effect with CSS `steps()`** (reduced-motion fallback) | Hero/Welcome/TypingEffect.tsx | Per-char JS updates block main thread; compositor CSS drops INP ~200ms → ~50ms on home hero |
| 9 | P1 | S | **Reserve space + GPU-accelerate CookieConsentBanner mount** (`contain:layout`, translate) | CookieConsentBanner.tsx | Bottom-fixed injected element is a top CLS source |
| 10 | P2 | S | **Throttle/IntersectionObserver the Navbar scroll listener** | Navbar/index.tsx | Unthrottled scroll handler adds 50–150ms INP; IO ≈ zero cost |
| 11 | P1 | M | **`Promise.all` homepage fetches + Suspense-stream hero** | (frontend)/[lang]/page.tsx | Sequential awaits delay TTFB; parallel + stream unblocks FCP/LCP |
| 12 | P2 | M | **Request-memoize (`React.cache`)** getPageMetadata/PostService/getDictionary across generateMetadata + render | blog pages, getDictionary.ts | Blog pages fetch same data twice/request; dedup saves 100–300ms TTFB |
| 13 | P2 | M | **ETag/Last-Modified + 304 on large GET APIs** | api/posts, api/projects, api/search | Saves bandwidth + TTFB on unchanged payloads (mobile/repeat) |
| 14 | P2 | S | **Cache the `/en→/` redirect; verify brotli on feed/llms text** | proxy.ts, next.config.mjs | Uncached redirect = origin hit per /en crawl; brotli shrinks text 5×. *(Pairs with #1.)* |
| 15 | P2 | M | **Cache-bust OG cover image on post edit** (version query / `revalidateTag('og-images')`) | api/posts/[postId]/cover.jpeg, route.ts | 24h-cached OG shows stale social previews after edits |
| 16 | P2 | S | **SSE stream headers** `X-Accel-Buffering: no` + keep-alive | api/chatbot/stream, api/notifications/stream | Edge buffering breaks real-time SSE delivery |
| 17 | P3 | S | **`private` cache for per-IP /api/geo; longer immutable TTL for ActivityPub** | api/geo, api/activitypub/actor+nodeinfo | Per-IP geo must not be publicly cached (cross-user leak) |

## Theme 2 — Images, Fonts & LCP

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 18 | P0 | M | **Delete/convert the two unused 10.9MB GIFs** (kuraydev.gif 5.1MB, kuraymain.gif 5.8MB) | public/kuraydev.gif, public/kuraymain.gif | Dead weight + accidental-reference risk; AVIF/MP4 is 5–10× smaller if real |
| 19 | P1 | M | **Recompress heavy images + drop `unoptimized` prop** (web.jpg 3.3MB, backend.jpg 3.1MB, phone.jpg 1.3MB, emptyuser.png 1.5MB) | services/*.jpg, emptyuser.png, SingleProject.tsx, BlockBackground.tsx | 3–30× larger than needed; `unoptimized` bypasses AVIF/WebP |
| 20 | P1 | S | **Replace deprecated `layout='fill' objectFit`** with `fill className='object-cover'` + sizes | Hero/Welcome + Hero/Timeline BackgroundImage.tsx | Deprecated since Next 13, may error in Next 16; prevents CLS |
| 21 | P1 | S | **`loading=lazy` on below-fold feed/related images** | FeedCardImage, PostCard, RelatedArticles/SingleArticle | Eager below-fold images inflate initial payload (500KB+) |
| 22 | P1 | M | **Add `sizes` to all responsive fill images missing it** | WelcomeBlock, TextImageBlock, UserProfile | Missing sizes inflates delivered bytes 20–40% on mobile |
| 23 | P1 | S | **Fix `MyImage` `width='0'/height='0'` literals** → real numeric dims + sizes | Hero/Welcome/MyImage.tsx | Zero dims block responsive variants + risk CLS |
| 24 | P1 | S | **Preload critical hero image; verify Inter WOFF2 preload** | layout.tsx, MyImageVideo.tsx | Preloading LCP image shaves 200–400ms |
| 25 | P1 | S | **Add `crossorigin` to CORS preconnects; remove redundant dns-prefetch** | layout.tsx | CORS origins without crossorigin force a 2nd handshake; preconnect already covers DNS |
| 26 | P1 | M | **Restrict Inter weight range** to those used (≈400–800) instead of 100–900 variable | layout.tsx, tailwind.config.ts | Unused weight outlines bloat each WOFF2 subset 15–20% |
| 27 | P2 | M | **Resize og.png to exact 1200×630 + WebP/AVIF variant** *(resolves #87)* | og.png, layout.tsx | Aspect mismatch distorts LinkedIn/Pinterest previews; WebP −25–35% |
| 28 | P2 | M | **Convert above-fold BlogPostBlock hero `<img>` → next/image** (fill+priority) | BlogPostBlock.tsx | Above-fold LCP candidate bypassing AVIF/WebP |
| 29 | P2 | M | **blurDataURL placeholders** on key above-fold images | HomeHeroBlock, BlogPostBlock, FeedCardImage | Prevents CLS + improves perceived load |
| 30 | P1 | S | **Pre-cache OG-image fonts at build** (drop runtime Google Fonts fetch + unused JetBrains Mono) | api/posts/[postId]/cover.jpeg | Runtime font fetch adds 200–500ms + external dep to OG gen |
| 31 | P2 | S | **De-dupe `spades.svg`** — import once as component, reuse via CSS transform | Hero/Welcome/MyImage.tsx | Removes redundant optimization + DOM duplication |
| 32 | P2 | S | **Complete system-font fallback stack** (`-apple-system`, BlinkMacSystemFont, emoji) | tailwind.config.ts | Native fallbacks render instantly; prevents invisible emoji |
| 33 | P2 | S | **Trim unused unicode-range font subsets** (drop Cyrillic/emoji if unused) | layout.tsx | Dead subsets add download weight |
| 34 | P3 | S | **Remove/self-host hardcoded Fira Code** ref in code blocks | CodePlaygroundRunner, codePlaygroundButton.ts | Unloaded hardcoded font causes FOIT in code samples |

## Theme 3 — JS/CSS Bundle & Code-Splitting

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 35 | P1 | S | **Dynamically import three.js KnowledgeGraph3D** (`ssr:false`); verify OrbitControls split; remove if dead | KnowledgeGraph3D/Button.tsx + index.tsx | three.js ~750KB gzip loads on every page w/ the button despite modal-only use |
| 36 | P1 | S | **Dynamically import react-player in HireMeVideo** | Hero/HireMe/HireMeVideo.tsx | ~100–200KB for a hidden video modal |
| 37 | P1 | M | **Route-level lazy-load TinyMCE** so it never bleeds into public bundles; preconnect cdn.tinymce.com | Editor/index.tsx, admin edit pages | TinyMCE ~800KB is admin-only; protect public TTI |
| 38 | P2 | S | **Dynamically import react-svg-worldmap** in HireMe + GeoHeatmap | HireMe/index.tsx, GeoHeatmapButton/content.tsx | ~100KB non-critical viz behind a button |
| 39 | P2 | S | **Add date-fns (and zod) to modularizeImports/optimizePackageImports** | next.config.mjs | Non-modularized date-fns pulls unused locale code (~30–50KB) |
| 40 | P2 | M | **Dispose WebGL context/listeners on KnowledgeGraph3D close** | KnowledgeGraph3D/index.tsx | Repeated opens leak 10–30MB RAM each |
| 41 | P3 | S | **Lazy-import canvas-confetti on interaction** | Newsletter/index.tsx | Decorative ~15KB should load only on click |
| 42 | P3 | S | **Make CSV export lazy** (parity with already-lazy XLSX/PDF) | DynamicTable/toolbar/ExportButton.tsx | Keeps admin chunk small |
| 43 | P1 | M | **Restrict DaisyUI to light/dark themes only** (not all 32) | tailwind.config.ts | themes.css ships ~947KB, ~80% unused → cuts CSS payload, improves FCP/LCP |
| 44 | P1 | S | **Wrap custom keyframes/utilities in `@layer`; verify Tailwind content globs include `./libs/**`** | tailwind.config.ts, globals.css | Base-layer custom CSS isn't deduped; risk of unpurged leaks |
| 45 | P2 | M | **`content-visibility:auto` + `contain-intrinsic-size` on off-screen heavy sections** | BaseBlock.tsx, Page.tsx | Skips layout/paint for hidden sections → FCP/LCP +10–30% on long pages |
| 46 | P2 | M | **Cheapen hover transforms + backdrop-blur on mobile** (transform/opacity only, smaller blur, scoped will-change) | PricingTableBlock, HeroBlock, SearchButton, ModalBackdrop | Non-GPU anims + heavy filters jank mobile GPUs |
| 47 | P3 | S | **Remove unused theme color tokens + errant `duration-1000`-on-padding classes** | tailwind.config.ts, Chatbot/index.tsx | Cleanup; duration-1000 on padding is a no-op copy-paste error |
| 48 | P3 | M | **Add `@media print` stylesheet** (hide nav/buttons, avoid page-break-inside) | globals.css | Print/PDF usability for articles & resume |

## Theme 4 — Metadata, Head & Structured Data

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 49 | P0 | M | **`robots:{index:false}` on all admin routes** via (admin)/layout.tsx | (admin)/layout.tsx, admin/page.tsx | ~36 admin routes inherit no robots directive; explicit noindex is best practice |
| 50 | P1 | S | **Return explicit `noindex` (not `{}`) from generateMetadata on missing/unpublished content** *(merges 5 findings)* | blog post/category, project, dynamic Page | Empty metadata lets indexable defaults cascade to draft/missing URLs |
| 51 | P1 | S | **Unique titles for the 5 auth pages** | auth/login,register,forgot-password,logout,callback | All read "Auth \| …" today — hurts UX + title audits |
| 52 | P1 | S | **my-links: use `SITE_URL` constant + declare canonical** | (my-links)/my-links/page.tsx | Uses `NEXT_PUBLIC_APPLICATION_HOST` → wrong/undefined host risk; missing canonical |
| 53 | P1 | S | **`og:image:alt` + `twitter:image:alt` everywhere** (projects + home miss it) | page.tsx, projects pages, layout.tsx | Meta/X require image alt for a11y + correct previews |
| 54 | P1 | M | **Dynamic `opengraph-image.tsx` for project detail** (title+tech overlay) | projects/[projectSlug]/opengraph-image.tsx | Projects fall back to static og.png; per-item OG lifts CTR |
| 55 | P2 | S | **Add `article:section` + `article:tag` to post OpenGraph** | blog post page | Improves article classification for search/social/News |
| 56 | P2 | M | **noindex filtered/paginated views via searchParams** (search/filter + page≥2 → canonical to page 1) | blog, category, projects pages | Query-param duplicates dilute crawl budget |
| 57 | P1 | M | **`rel=next/prev` link tags for paginated listings** *(merges 3; pair with #56)* | blog, category, projects, Feed | Without it, page 2+ crawled as duplicate, splitting authority |
| 58 | P1 | M | **Fix Article author URL + `ImageObject` for featured images** (also Organization logo) *(merges 4)* | MetadataHelper.tsx, post page | Accurate author URL → E-E-A-T; ImageObject w/ dims → image rich results |
| 59 | P1 | M | **Wrap Comments JSON-LD in `@context`/`@graph`** (currently invalid bare array) | MetadataHelper.tsx | Bare array w/o @context = invalid JSON-LD, Google ignores it |
| 60 | P2 | M | **Emit BlogPosting only** (drop redundant Article/NewsArticle) on posts | MetadataHelper.tsx, post page | Dual schemas confuse crawlers; BlogPosting is richer |
| 61 | P3 | S | **`numberOfItems` on portfolio ItemList; enrich CollectionPage parts** | MetadataHelper.tsx | Aids carousel understanding + SERP previews |

## Theme 5 — AI/LLM Discovery & Rich-Result Schemas

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 62 | P1 | S | **Delete duplicate `public/llm.txt`** (has `http://localhost:3000`); keep `llms.txt`+`llms-full.txt` | public/llm.txt, public/llms.txt | Two conflicting files (one with localhost) confuse AI crawlers |
| 63 | P1 | S | **Add Contact/License/Citation section to llms-full.txt** | app/llms-full.txt/route.ts | Gives AI explicit attribution/licensing rules |
| 64 | P2 | M | **Add HowTo + FAQPage schema helpers** wired into tutorial posts + FAQ blocks *(merges 2)* | MetadataHelper.tsx, FAQBlock.tsx | Unlocks step/Q-A rich snippets + answer-engine (GEO) signals |
| 65 | P2 | M | **Add VideoObject schema** for react-player embeds + parsed `<iframe>` | MetadataHelper.tsx, Article/index.tsx | Enables video rich results + Google Video discovery |
| 66 | P2 | M | **Add Speakable schema** marking intro/key-takeaway selectors | MetadataHelper.tsx | Helps voice/answer engines prioritize passages |
| 67 | P2 | L | **Markdown (`.md`) endpoint variants** for blog/projects + `<link rel=alternate type=text/markdown>` | blog/project route handlers | Markdown preserves structure for AI pipelines |
| 68 | P3 | M | **Add DefinedTerm + ClaimReview schema helpers** (selective) | MetadataHelper.tsx | Helps LLMs extract definitions/claims, reduce hallucination |
| 69 | P3 | S | **Add `public/ai.txt`** AI-policy file | public/ai.txt | Emerging 2025 standard signaling AI-aware stance |

## Theme 6 — Sitemaps, Feeds & Crawl Directives

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 70 | P1 | S | **Project sitemap `lastmod` → real `updatedAt`** | ProjectService.ts, sitemap.ts | Build-time `now` marks every project fresh → wastes crawl budget |
| 71 | P2 | M | **Add category archive pages to sitemap** (`/blog/{categorySlug}`) | sitemap.ts, CategoryService.ts | Category hubs improve internal linking/discovery |
| 72 | P2 | S | **Use real max-content date for sitemap/feed `lastBuildDate`** | feed.xml, sitemap.ts | Always-now timestamps = false freshness signals |
| 73 | P1 | M | **Image sitemap entries (`<image:image>`) for posts/projects** | sitemap.ts, robots.ts | Improves image-search discoverability for a portfolio site |
| 74 | P1 | S | **Add missing AI crawler allowlists** (Bytespider, Amazonbot, Applebot-Extended, Meta-ExternalAgent, Diffbot, cohere-ai, ImagesiftBot, Timpibot) | robots.ts | Visibility in emerging AI ecosystems |
| 75 | P2 | S | **`X-Robots-Tag: noindex` on utility routes** (/s/ redirects, llms-full.txt, /api/search) *(merges 3)* | s/[code], llms-full.txt, api/search | Defense-in-depth so utility/JSON never ranks |
| 76 | P2 | M | **Add Atom + JSON Feed + per-category feeds** w/ `<link rel=alternate>` *(merges 2)* | feed.atom, feed.json, feed/[categorySlug], layout.tsx | Maximizes aggregator compatibility + topic subscriptions |
| 77 | P3 | S | **Add `Crawl-delay` + document noindex strategy comment** in robots | robots.ts | Crawl hygiene for a force-dynamic site |
| 78 | P3 | M | **WebSub hub link + `rel=canonical` Link headers on feeds** *(merges 3)* | feed.xml, llms-full.txt | WebSub = near-real-time delivery; canonical clarifies single-purpose resource |
| 79 | P3 | L | **Plan sitemap-index/splitting (gzip, limit/offset) for 50k/50MB scale** | sitemap.ts, robots.ts, SitemapGenerator.ts | Future-proofs against per-file sitemap limits |

## Theme 7 — i18n, Hreflang & Canonicalization

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 80 | P0 | S | **Use `301` (not 307/302) for `/en→/` + geo-exclusive redirects** | proxy.ts | 307/302 don't consolidate PageRank; the canonicalization is permanent |
| 81 | P1 | M | **Make WebSite JSON-LD `inLanguage` dynamic** (not hardcoded en-US) | MetadataHelper.tsx, page.tsx | Declaring only en-US contradicts hreflang + 11 langs |
| 82 | P1 | M | **Emit `og:locale` + `og:locale:alternate`** per translated page | MetadataHelper.tsx, page.tsx, HreflangHelper.ts, layout.tsx | Social crawlers pick the right language version |
| 83 | P2 | S | **Align `en` region code to `en_GB`** per COUNTRY_OVERRIDES | I18nTypes.ts, layout.tsx | Locale inconsistency affects regional social variants |
| 84 | P2 | M | **Only emit hreflang/x-default for langs with real translated content** *(merges 2)* | HreflangHelper.ts, sitemap.ts, post page | Advertising untranslated/noindexed pages triggers Search Console hreflang-mismatch warnings |
| 85 | P2 | M | **Handle geo-exclusive langs (ar) in hreflang/noindex** *(merges 2)* | proxy.ts, I18nTypes.ts, sitemap.ts | Geo-restricted hreflang = mismatch ambiguity |
| 86 | P2 | S | **Declare www→non-www canonicalization** (verify www doesn't resolve, or redirect) | robots.ts, next.config.mjs | www + non-www can index as separate sites |

## Theme 8 — Social, OG Image, PWA & Icons

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 87 | P1 | S | **Reconcile declared OG dims with actual file** (resize to 1200×630 — see #27) | layout.tsx, og.png | Declared 1200×630 vs actual **1280×769** breaks previews / strict crawlers |
| 88 | P1 | S | **`viewport-fit=cover` + `display_override` for notch-aware PWA** | layout.tsx, manifest.webmanifest | Required for safe-area-inset; missing → content behind notch + lower PWA score |
| 89 | P2 | S | **Complete manifest** (`type` attr on link, screenshots, share_target, monochrome icons) *(merges 2)* | layout.tsx, manifest.webmanifest | Better install UX + Android share-to |
| 90 | P2 | M | **favicon.svg + 16/32 png + safari-pinned-tab + browserconfig.xml** | public/* + layout.tsx | SVG favicon scales any DPI; Safari/Windows brand consistency |
| 91 | P3 | M | **`og:see_also` (or profile type) on homepage** → /blog,/projects,/about | (frontend)/[lang]/page.tsx | Improves knowledge-graph + structure understanding |
| 92 | P3 | L | **Extend SW with cache strategies** (cache-first static, SWR for listings) — ideally Serwist | public/sw.js | Better PWA score + offline fallback |

## Theme 9 — Blog Content E-E-A-T & UX Signals

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 93 | P1 | M | **Author byline w/ `rel=author`, bio, credentials + expand author profile** *(merges 3)* | Blog/PostHeader, users/[username]/page.tsx | E-E-A-T core ranking factor; visible credentials raise trust/CTR |
| 94 | P1 | S | **Visible "Updated: [date]" on significantly-updated posts** (updatedAt > createdAt+7d) | Blog/PostHeader | Freshness E-E-A-T signal; lifts SERP CTR |
| 95 | P3 | S | **Word count + refined reading-time + comment count** *(merges 3)* | PostHeader, Comments | Comprehensiveness + social-proof signals |
| 96 | P2 | M | **ItemList schema on related/other-posts carousels** | Blog/OtherPosts | Helps Google understand relationships + carousels |
| 97 | P2 | M | **Series CollectionPage schema + `isPartOf`** (optionally /blog/series/[slug]) | Blog/SeriesNav, post page | Multi-part understanding + series carousels |

## Theme 10 — Security, CSP & Best-Practices

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 98 ⚠️ | P0 | M | **Site-wide Content-Security-Policy** (currently only on `/sw.js`) — scoped for GA/reCAPTCHA/TinyMCE; `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` *(merges 3)* | next.config.mjs, layout.tsx, ThemeSyncScript.tsx | Inline scripts + 3p loads unprotected (OWASP A03). **Test all inline scripts/embeds don't break.** |
| 99 | P0 | M | **Sanitize `dangerouslySetInnerHTML` in dynamic blocks** (DOMPurify allowlist, as Article.tsx does) | CustomBlock, TemplateBlockRenderer, BlogPostBlock, ProseBlock | Unsanitized DB/template HTML = XSS/injection vector |
| 100 | P1 | S | **Fix CORS `'*'` fallback** — only echo validated origin, never `*` | middlewares/cors.ts | `isAllowed ? origin\|\|'*' : ''` can emit `*` → any origin reaches protected endpoints |
| 101 | P1 | M | **Fix `postMessage('*')` → origin; tighten CodePlayground iframe sandbox** *(merges 2)* | CodePlaygroundRunner, codePlaygroundButton.ts | Wildcard targetOrigin leaks messages; least-privilege sandbox |
| 102 | P1 | M | **Add COOP/COEP/CORP cross-origin isolation headers** | next.config.mjs | Spectre protection + Lighthouse best-practices |
| 103 ⚠️ | P1 | M | **CSP nonce + `strict-dynamic`** for inline scripts (after #98) | proxy.ts, layout.tsx, ThemeSyncScript.tsx | OWASP L3 CSP; prevents allowlist bypass. **Depends on #98; verify every inline script gets the nonce.** |
| 104 | P2 | S | **Remove deprecated `X-XSS-Protection`** | middlewares/security.ts | Deprecated by OWASP, superseded by CSP |
| 105 | P1 | S | **Verify prod source maps disabled** (`productionBrowserSourceMaps:false`, deny `*.map` at edge) | next.config.mjs | Exposed maps leak original code |
| 106 | P2 | M | **Enforce HTTPS redirect in production** (or document Vercel native) | proxy.ts | HSTS preload assumes initial HTTPS; prevents mixed-content/MITM |
| 107 | P3 | S | **Remove debug `console.log` from code-playground template** | codePlaygroundButton.ts | Debug code shouldn't ship |

## Theme 11 — Third-Party Scripts, Consent & Resource Hints

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 108 | P0 | M | **Gate GoogleAnalytics + WebVitals behind cookie consent** (load/send only when accepted) | layout.tsx, WebVitals/index.tsx, CookieConsentBanner.tsx | GA + vitals load unconditionally → GDPR/KVKK violation; banner is UI-only. *(User-confirmed.)* |
| 109 | P1 | M | **Defer reCAPTCHA until form interaction + preconnect** *(merges 2)* | Hero/Contact, register page, Contact/Form.tsx, layout.tsx | Eager reCAPTCHA iframe adds 200–500ms render-blocking to LCP |
| 110 | P2 | S | **Downgrade GA/GTM preconnect → dns-prefetch; keep image CDNs preconnected** | layout.tsx | Preconnect budget ~4–6 origins; analytics is non-blocking |
| 111 | P3 | S | **Timeout/AbortController + fallback on ipapi.co geo fetch** | Contact/Form.tsx | Slow 3p geo can block form interactivity (FID) |
| 112 | P2 | M | **Speculation Rules API prefetch + explicit `router.prefetch` on listings** | layout.tsx, blog + projects pages | Instant next-nav (Chrome 123+), next-page LCP −200–400ms |
| 113 | P3 | S | **`importance='low'` on retained analytics hints** | layout.tsx | Deprioritizes non-blocking hints under congestion |

## Theme 12 — Accessibility & Semantics

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 114 | P1 | M | **`<header role=banner>` landmark + `headingLevel` prop on blocks** (never skip levels) *(merges 2)* | Navbar, (frontend)/layout, FAQ/Comparison/Timeline blocks | Landmarks + heading-order are WCAG A + Lighthouse audits |
| 115 | P2 | M | **Table semantics** (`<caption>`, `scope`, labeled bulk-select checkbox) *(merges 3)* | ComparisonBlock, DynamicTable/TableHead | WCAG A / Lighthouse table-semantics |
| 116 | P2 | S | **`role=status aria-live=polite` on react-toastify** | Toast/ToastContainerClient.tsx | Screen-reader users must hear toasts (WCAG A) |
| 117 | P1 | S | **Expand/collapse sr-only text on FAQ accordion buttons** | FAQBlock.tsx | Explicit toggle state for SR (WCAG AA button-name) |
| 118 | P2 | M | **Keyboard access + `role=img`/aria-label for 3D graph + world map** *(merges 2)* | KnowledgeGraph3D, GeoHeatmapButton/content | Interactive viz must be keyboard accessible (WCAG A) |
| 119 | P2 | M | **Extend Lighthouse a11y/contrast gate to /admin, /settings, /auth** | lighthouserc.cjs | Private pages should meet the same WCAG AA bar |

## Theme 13 — Mobile Viewport & Touch

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 120 | P1 | S | **All form inputs ≥16px** (prevent iOS zoom-on-focus) | DemoRequestBlock, DynamicText, tailwind.config.ts | Sub-16px triggers iOS auto-zoom (mobile red flag) |
| 121 | P1 | M | **Cookie banner <30% mobile viewport** | CookieConsentBanner.tsx | >30% fails Google intrusive-interstitial audit |
| 122 | P1 | S | **Reduce fixed-navbar `pb-6` dead-space on mobile** | Navbar, (frontend)/layout | Wasted top viewport reduces usable area + LCP |
| 123 | P2 | M | **Enforce 48px tap targets + `touch-action:manipulation`** | CookieBanner, DynamicText, DynamicRadio, tailwind.config | Lighthouse mobile tap-targets audit |
| 124 | P2 | M | **`env(safe-area-inset-*)` for notched devices** (pairs with #88) | globals.css, Navbar, CookieBanner | Content hides behind notch on PWA without it |
| 125 | P2 | M | **Audit horizontal overflow (tables/tabs/modals) ≤100vw** *(merges 2)* | ComparisonBlock, Tabs, TableView, HeadlessModal, globals.css | Horizontal scroll fails mobile viewport audit |
| 126 | P2 | M | **Add `active:` variants alongside `hover:`** (or `@media (hover:hover)`) | CardGrid/LinkedCards/Platforms blocks, globals.css | Hover never fires on touch → no feedback |
| 127 | P2 | S | **`clamp()` fluid typography for hero headings** | HomeHeroBlock, DemoRequestBlock, globals.css | Smoother mobile scaling vs hard breakpoints |

## Theme 14 — Monitoring, Tooling, Status Codes & CI Gates

| # | P | Eff | Item | Key files | Why |
|---|---|---|---|---|---|
| 128 | P1 | M | **Migrate to flat ESLint config** (`eslint.config.js`) + `@next/eslint-plugin-next` + `eslint-plugin-jsx-a11y`; fix `lint` script | .eslintrc.json, package.json, eslint.config.js | Next 16 removed `next lint`; lint + a11y checks don't run today |
| 129 | P1 | M | **Wire error reporting (Sentry/PostHog) into global-error + /api/errors** | global-error.tsx, api/errors | Errors only console.log + vanish on reload |
| 130 | P2 | M | **Per-segment `error.tsx` boundaries** (blog, api) | blog/error.tsx, api/error.tsx | Only global boundary exists; segment recovery improves UX |
| 131 | P2 | M | **Return `410 Gone` for hard-deleted content** (`deletedAt`) | blog post/category, project pages | 410 stops re-crawl waste vs 404's "temporary" |
| 132 | P1 | M | **Metric-level Lighthouse budgets** (error on LCP<2500, CLS<0.1, INP<200) | lighthouserc.cjs | Warn-only category gates let CWV regressions slip through merges |
| 133 | P1 | M | **Optional custom RUM endpoint** (`/api/vitals-collect`, Redis time-series) — respects consent (#108) | WebVitals/index.tsx, api/vitals-collect | GA4 has 24–48h lag; real-time RUM catches deploy regressions |
| 134 | P1 | L | **Broken-link + redirect-chain crawler in CI** (validates sitemap + hreflang targets) | scripts/link-crawler.ts, .github/workflows/seo.yml | No automated dead-link/redirect-chain detection today |
| 135 | P2 | M | **axe-core a11y tests in CI** (fail on critical/serious) | tests/a11y.test.ts, jest.config.ts | Catches context issues Lighthouse misses |
| 136 | P2 | M | **Bundle-size CI gate** (fail >5% app / >3% vendor growth) — after #35–39 | scripts/check-bundle-size.ts, seo.yml | Unchecked heavy-dep growth degrades FCP/INP |
| 137 | P2 | M | **CrUX/PageSpeed field-data sync (cron)** — P75 CWV per route → Redis → status page | api/crux-sync, scripts/crux-poll.ts | Lab Lighthouse diverges from real-user CrUX |

---

## Quick wins (high impact, low effort — do first)

#4, #18, #20, #21, #23, #24, #25, #30, #35, #36, #50, #51, #52, #53, #62, #63, #70, #74, #80, #87, #100, #104, #105, #117, #120, #122, #128.

## Sequencing & dependency notes

1. **Caching is the #1 field-perf lever.** Do #1 (Vary/Cache-Control) before #3 (tags need a cache to invalidate) and before #14 (sibling redirect caching). #5 streaming is large/risky → schedule **last**.
2. **Security order:** ship base CSP (#98) **before** nonce/strict-dynamic (#103). #99/#100/#101 are independent — land immediately. #108 consent-gating is P0 legal; #133 RUM must also respect that gate.
3. **Pagination** (#56 noindex page 2+ and #57 rel=next/prev) shares `searchParams` plumbing — implement together.
4. **OG image:** resolve dimension mismatch **one** way — resize og.png to 1200×630 (#27), which makes #87 moot.
5. **Bundle CI gate (#136)** only meaningful after dynamic-import work (#35–#39) sets a lean baseline. **Metric budgets (#132)** pair with field data (#133/#137) so thresholds reflect real CrUX P75.
6. **Verify-don't-assume:** caching (#1/#14/brotli) depends on Vercel/CDN — confirm with `curl -I` post-deploy. #86 (www-canonical) and #105 (source maps) are partly verification tasks.
7. **Already correct (no action):** `trailingSlash:false` enforced; `/en→/` redirect exists (only status #80 + caching #14 needed); ExportButton jspdf/exceljs already lazy; Article.tsx already sanitizes (it's the #99 template); footer social aria-labels already correct.

---

## Verification

After each wave:

- **SEO + a11y regression gate:** `npm run test:seo` and `npm run lhci` — must stay **SEO=1.00 / a11y≥0.95** on the 5 routes (extend route list per #119).
- **Structured data:** validate every changed page through Google Rich Results Test + Schema.org validator (catches #59 bare-array, #58 ImageObject, #64/#65 new schemas).
- **CWV / perf:** `npm run analyze` (bundle deltas for #35–#48), Lighthouse perf trace to confirm the LCP element (#2) and CLS<0.1 (#7/#9/#20). After #132, the metric budgets gate this in CI.
- **Caching/headers:** `curl -sI https://kuray.dev/ -H 'x-lang: tr'` and `/blog`, `/sitemap.xml`, `/robots.txt`, `/feed.xml` — confirm `Cache-Control`, `Vary`, `Content-Encoding: br`, and `X-Robots-Tag` (#1/#4/#14/#75).
- **Security:** scan with [securityheaders.com](https://securityheaders.com) + Mozilla Observatory after #98/#102/#104; manually exercise every inline script/embed (ThemeSyncScript, GA, reCAPTCHA, TinyMCE, JSON-LD) to confirm CSP doesn't break them (#98/#103).
- **i18n:** Search Console "International Targeting" report has zero hreflang errors after #84/#85; spot-check `og:locale:alternate` on a translated post (#82).
- **Consent:** with consent denied, confirm **no** GA/vitals network requests fire; with accepted, confirm they do (#108).
- **Social previews:** validate via [opengraph.xyz](https://www.opengraph.xyz) / LinkedIn Post Inspector / X Card Validator after #27/#53/#54/#87.
- **Crawl health:** run the #134 link-crawler; expect zero 404/410/5xx on internal links and no redirect chains >2 hops.
- **Field data (ongoing):** watch CrUX (#137) and GA4 Web Vitals (#133) for 2–4 weeks post-deploy — target all-green LCP/CLS/INP at P75 mobile.
