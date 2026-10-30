# Technical SEO Implementation Plan

## 1. Prioritized Task Roadmap

| Task | Priority | Scope | Acceptance Criteria |
|---|---|---|---|
| **P0: Fix Prerendering Blocker on `/`** | P0 | `client/src/app/page.tsx` | Full DOM (Hero, Features, Multiverse, Footer) rendered in static HTML; splash animation converted to client-only overlay. |
| **P0: Robots & Sitemap Engine** | P0 | `client/src/app/robots.ts`, `sitemap.ts` | `/robots.txt` and `/sitemap.xml` return valid HTTP 200 responses with production host resolution. |
| **P1: Centralized SEO & Canonical Architecture** | P1 | `client/src/lib/seo.ts`, layouts | Unified metadata constructor supporting self-referential canonicals, Open Graph, Twitter cards, and title templates. |
| **P1: Semantic Heading Structure (`<h1>`)** | P1 | All public page routes | Every public route renders a unique, crawlable `<h1>` element. |
| **P1: Route Indexability Boundaries** | P1 | `/admin`, `/room`, `/dashboard` | Explicit `noindex, nofollow` headers and robots disallows on private application routes. |
| **P2: Schema.org Structured Data System** | P2 | `layout.tsx`, `MultiverseFAQ.tsx` | Valid JSON-LD for `WebSite`, `Organization`, `SoftwareApplication`, and `FAQPage`. |
| **P2: Internal Linking & Orphan Elimination** | P2 | `client/src/components/Footer.tsx` | Comprehensive crawl paths connecting all legal, system status, feedback, and support pages. |
| **P3: Keyword-Targeted Informational Expansion** | P3 | `client/src/components/landing/MultiverseFAQ.tsx` | New accessible accordion addressing user search intent around privacy, ephemeral messaging, and setup. |
| **P3: Automated Testing & Verification CI** | P3 | `client/scripts/validate-seo.mjs` | Automated script verifying sitemaps, robots, HTML titles, canonicals, and heading tags upon build. |

---

## 2. Dependencies & Operational Rules

1. **No Redesign / Identity Preservation:** The Spider-Verse aesthetic, halftone styling, and comic shadows must remain intact.
2. **Zero Regressions on Real-Time Relays:** Socket.IO connections, room joins, and direct messages must not be impacted.
3. **Strict Privacy Architecture:** Zero server-side persistence of public room messages is preserved.

