# Project 03 — Bookshelf

A reading tracker built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Better Auth, Drizzle ORM, and SQLite. Read [ASSIGNMENT.md](ASSIGNMENT.md) for the requirements.

## Run locally

Use Node.js 24. From this directory:

```bash
npm ci
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local`. Set `BETTER_AUTH_SECRET` to a random secret of at least 32 characters and `SEED_USER_PASSWORD` to a local demo password. Keep `.env.local` out of Git.

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Visit `http://localhost:3000`. The seed creates `mayareads` and `alexpages` with books. Their email addresses are `maya@example.test` and `alex@example.test`; both use the password you set in `SEED_USER_PASSWORD`. You can also create your own account.

## Checks

```bash
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
```

The assignment's CI runs lint, build and Vitest. Vitest has 43 tests, including actions against an in-memory SQLite database. Playwright covers sign-up through a public profile. Run the build before Playwright: its web server uses the production build. Playwright uses Google Chrome locally and its bundled Chromium in CI. The E2E test starts a small Open Library fixture server so it does not depend on the public API during tests.

## How the app is organized

- `src/app/(marketing)` has the landing page and public reader profiles. `src/app/(auth)` has sign-in and sign-up. `src/app/(app)` is protected by the proxy and a server-side session check in its layout.
- `src/lib/data` contains server-only database queries and Open Library calls. Search responses are validated with Zod and cached for one hour; work and author responses are cached for one day.
- `src/actions` validates each form, checks the session and ownership, writes through `src/lib/data/mutations.ts`, then revalidates affected paths. The move form uses `useOptimistic` while its action runs.
- `src/lib/db` defines the Drizzle schema and seed. `drizzle/` contains committed migrations. `reading_logs` keeps per-update page counts so the dashboard can calculate pages read this month.
- `GET /api/export` downloads your library as CSV. `/u/[username]/feed.xml` exposes recent public reviews. Profile metadata, a dynamic Open Graph image, a sitemap and robots rules support sharing.

Book links from search open an intercepted modal; refreshing the same URL shows the full detail page. Next.js 16.4 has a development-only route matching issue with catch-all parallel slots in sibling route groups, so `next.config.ts` enables loose matching only in development.

## Lighthouse

The public profile `/u/mayareads` scored **100 Performance, 100 Accessibility and 100 SEO** with a production build in Google Chrome. See the [Lighthouse screenshot](docs/lighthouse-profile.png). The report can be reproduced with:

```bash
npm run build
npm run start
npx lighthouse http://localhost:3000/u/mayareads --output=html --output=json --output-path=./docs/lighthouse-profile --only-categories=performance,accessibility,seo
node scripts/capture-lighthouse.mjs
```
