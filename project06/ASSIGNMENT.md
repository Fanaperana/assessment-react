# Project 06 — DevFolio 🌐 (Astro)

Build **DevFolio**, your own developer portfolio and blog, with **Astro**.

Astro sends **zero JavaScript by default** and adds interactivity only where you ask for it ("islands"). This project teaches content-driven sites: static generation, typed content collections, MDX, image optimization, view transitions, i18n — and how to reach a perfect Lighthouse score.

- **Level:** Intermediate
- **Suggested time:** 2 weeks
- **Content:** your real projects (ShopLite, FlowBoard, …) and at least **5 blog posts** about what you learned. Write them yourself.

---

## 1. What you are building

1. **Home** — short intro, featured projects, latest posts.
2. **Projects** — a grid of projects with tags, filter by technology, and a page per project (screenshots, stack, links, what you learned).
3. **Blog** — posts in MDX with code blocks, table of contents, reading time, tags, previous/next links, and an RSS feed.
4. **About** — your story, skills and a timeline.
5. **Uses** — the tools you use.
6. The whole site in **two languages** (English + one more, for example French).

---

## 2. Rules

- ✅ Astro + TypeScript (strict) (already set up). Static output (`output: 'static'`).
- ✅ Integrations allowed: `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/react` (or Svelte / Vue / Solid for islands), `@tailwindcss/vite`.
- ✅ Content lives in **content collections** (`src/content.config.ts`) with Zod schemas.
- ❌ No full-page React app. Pages are `.astro` files. Only interactive parts are islands.
- ❌ No CSS frameworks other than Tailwind. No external analytics or trackers.

---

## 3. Requirements

### Part A — Content collections

- **A1** Collections `blog` (MDX) and `projects` (Markdown or JSON/YAML) with Zod schemas: title, description, dates, tags, draft, cover image (`image()` helper), and for projects: stack, repo URL, demo URL, featured.
- **A2** Draft posts are visible in `astro dev` but not in the production build.
- **A3** A `tags` page per tag (`/tags/[tag]`) built with `getStaticPaths`.

### Part B — Pages and routing

- **B1** Layouts: `BaseLayout` (head, header, footer) and `PostLayout` (title, date, reading time, table of contents).
- **B2** Blog index with pagination (`paginate()`), 6 posts per page.
- **B3** Custom `404.astro`.

### Part C — Islands

- **C1** A **theme toggle** island (no flash of the wrong theme: an inline script sets the class before paint).
- **C2** A **project filter** island (filter by technology) that loads with `client:visible`.
- **C3** A **search** island: build a JSON index at build time with an endpoint (`src/pages/search.json.ts`) and search it in the browser.
- **C4** Explain in the PR which `client:*` directive you used for each island and why.

### Part D — MDX and code

- **D1** Code blocks with syntax highlighting (Shiki), a copy button, and file name labels.
- **D2** At least two **custom MDX components** used in posts (for example `<Callout type="warning">`, `<Demo>`).
- **D3** Heading anchors and an auto-generated table of contents.

### Part E — Images and performance

- **E1** All images use `astro:assets` (`<Image />` / `<Picture />`) with width, height and modern formats.
- **E2** Lighthouse (mobile) on Home and on a blog post: **100 / 100 / 100 / 100** (screenshots in the PR).
- **E3** The home page ships **less than 15 kB** of JavaScript (check the build output).

### Part F — Internationalization

- **F1** Astro i18n routing: `/` (default language) and `/fr/` (or your second language). UI strings in a typed dictionary.
- **F2** A language switcher that keeps you on the same page. `hreflang` links in the head.

### Part G — SEO and feeds

- **G1** Unique title, description, canonical URL and Open Graph tags on every page.
- **G2** `sitemap-index.xml`, `robots.txt` and an RSS feed (`/rss.xml`).
- **G3** Generate an Open Graph image per blog post at build time (endpoint with `satori` + `sharp`, or a similar approach).

### Part H — Accessibility and polish

- **H1** View Transitions (`<ClientRouter />`) between pages, disabled for `prefers-reduced-motion`.
- **H2** Skip link, visible focus, correct heading order, alt text everywhere.
- **H3** Print styles for blog posts.

### Part I — Testing and CI

- **I1** `astro check` and the build pass with no warnings.
- **I2** Playwright: every page in the sitemap returns 200, has one `<h1>` and no broken internal links.
- **I3** A unit test for the reading-time function and the search function (Vitest).

---

## 4. Bonus (up to +15)

- **X1** Deploy to GitHub Pages, Netlify or Cloudflare Pages with a custom domain.
- **X2** Use **Pagefind** for search instead of your own index, and compare both in the PR.
- **X3** Comments with Giscus (GitHub Discussions).
- **X4** A "Now playing / Now reading" widget with **server islands** (`server:defer`) and an adapter.
- **X5** Write one post that explains a bug you fixed in FlowBoard, with an interactive demo island.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Content collections and schemas | 15 |
| B — Layouts, pagination, routing | 10 |
| C — Islands and hydration choices | 15 |
| D — MDX, code blocks, custom components | 10 |
| E — Images and performance | 15 |
| F — i18n | 10 |
| G — SEO, sitemap, RSS, OG images | 10 |
| H — Accessibility and view transitions | 5 |
| I — Tests and checks | 5 |
| Code quality (Q1–Q5) and writing quality of the posts | 5 |

Passing grade: 70. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
