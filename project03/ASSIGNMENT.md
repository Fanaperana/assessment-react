# Project 03 — Bookshelf 📚 (Next.js)

Build **Bookshelf**, a reading tracker with public profiles, using **Next.js (App Router)**.

You know React in the browser. This project teaches React **on the server**: Server Components, Server Actions, streaming, caching, a real database, authentication and SEO.

- **Level:** Advanced
- **Suggested time:** 3 weeks
- **Book data:** [Open Library API](https://openlibrary.org/developers/api) (free, no key). Use `https://openlibrary.org/search.json?q=...` and `https://openlibrary.org/works/{id}.json`. Covers: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`.

---

## 1. What you are building

A user can:

1. Sign up, sign in and sign out (email + password).
2. Search books from Open Library and open a book page.
3. Add a book to a shelf: **Want to read**, **Reading**, **Read**.
4. Rate a read book (1–5), write a short review, and log reading progress (pages).
5. See a dashboard: books per shelf, pages read this month, a yearly goal with a progress bar.
6. Have a **public profile** at `/u/[username]` that anyone can see and share (with a nice preview image on social media).

---

## 2. Rules

- ✅ Next.js App Router + TypeScript + Tailwind CSS (already set up). No Pages Router.
- ✅ **Drizzle ORM + SQLite** for the database (`drizzle-orm`, `drizzle-kit`, `better-sqlite3` or `@libsql/client`). Migrations are committed.
- ✅ **Better Auth** (or Auth.js) for email + password authentication. Passwords are never stored in plain text.
- ✅ **Zod** to validate every Server Action input and every API response from Open Library.
- ✅ You may use shadcn/ui.
- ❌ No client-side data-fetching libraries (TanStack Query, SWR). Fetch data in Server Components.
- ❌ No `"use client"` on pages or layouts. Only small interactive leaf components are client components.
- ❌ Never commit `.env` or real secrets. Commit `.env.example`.

---

## 3. Requirements

### Part A — Routing and layouts

- **A1** Use route groups: `(marketing)` for the landing page, `(app)` for signed-in pages, `(auth)` for sign-in / sign-up.
- **A2** Every data page has `loading.tsx` (skeletons), `error.tsx` (with a reset button) and `not-found.tsx`.
- **A3** Book details open in a **modal** when you click a book in search results (intercepting route `(.)books/[id]` + parallel route `@modal`). A reload of the same URL shows the full book page.
- **A4** Dynamic routes: `/books/[id]`, `/u/[username]`, `/shelves/[shelf]`.

### Part B — Server Components and data

- **B1** All reads happen in **Server Components** (or in `lib/` functions they call). No `useEffect` fetching.
- **B2** Open Library calls use `fetch` with caching (`next: { revalidate: 86400 }`). Search results are not cached for longer than one hour.
- **B3** The dashboard streams: slow widgets are wrapped in `<Suspense>` with their own skeletons, so the page shell shows at once.
- **B4** Put all data access in a `lib/data/` layer with `import 'server-only'`.

### Part C — Server Actions and forms

- **C1** Add to shelf, move between shelves, rate, review, log progress and set the yearly goal are **Server Actions**.
- **C2** Forms use `useActionState` and show field errors from Zod. The submit button shows a pending state (`useFormStatus`).
- **C3** After a mutation, call `revalidatePath` / `revalidateTag` so every affected page updates.
- **C4** "Move to shelf" is optimistic with `useOptimistic`.
- **C5** Every action checks that the user is signed in **and** owns the data. Never trust an ID from the form.

### Part D — Database

- **D1** Schema: `users`, `books` (cache of Open Library data), `shelf_entries` (user, book, shelf, rating, review, pages read, dates), `reading_goals`.
- **D2** Migrations with `drizzle-kit`. A `npm run db:seed` script creates two demo users with books.
- **D3** Use database constraints: unique `(user_id, book_id)`, a check on rating 1–5, foreign keys.

### Part E — Authentication

- **E1** Sign up, sign in, sign out with Better Auth (or Auth.js). Session in an HTTP-only cookie.
- **E2** Protect `(app)` routes on the server (middleware/proxy **and** a check in the layout). Redirect to sign-in with a `callbackUrl`.
- **E3** Users choose a unique `username` (validated) for their public profile.

### Part F — Route Handlers

- **F1** `GET /api/export` downloads the signed-in user's library as **CSV**.
- **F2** `GET /u/[username]/feed.xml` — an RSS feed of the user's latest reviews.

### Part G — SEO and sharing

- **G1** `generateMetadata` on book and profile pages (title, description, canonical URL).
- **G2** Dynamic Open Graph image for profiles with `opengraph-image.tsx` (name, books read this year, top 3 covers).
- **G3** `sitemap.ts` and `robots.ts`.

### Part H — Performance and accessibility

- **H1** Images use `next/image` with the Open Library domain in `next.config.ts`. Fonts use `next/font`.
- **H2** Lighthouse on the public profile page: Performance ≥ 90, Accessibility ≥ 95, SEO 100 (screenshot in the PR).
- **H3** No hydration warnings in the console.

### Part I — Testing

- **I1** Vitest unit tests for Zod schemas, the stats calculation (pages per month, goal progress) and the CSV export.
- **I2** Tests for at least three Server Actions (call the action function with a fake session and a test database).
- **I3** Playwright: sign up → search → add to shelf → mark as read with a rating → public profile shows the book.
- **I4** At least **25** tests in total.

---

## 4. Bonus (up to +15)

- **X1** Import a Goodreads CSV export.
- **X2** Follow other users and see a feed of their activity.
- **X3** Use Next.js `"use cache"` / `cacheTag` (Cache Components) and explain the difference from `revalidate`.
- **X4** Deploy to Vercel with Turso (libSQL) as the database.
- **X5** Full-text search inside your own library with SQLite FTS5.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Routing, layouts, intercepted modal | 10 |
| B — Server Components, caching, streaming | 15 |
| C — Server Actions, forms, optimistic UI, authorization | 20 |
| D — Database schema, migrations, seed | 10 |
| E — Authentication and route protection | 10 |
| F — Route Handlers (CSV, RSS) | 5 |
| G — SEO, OG image, sitemap | 10 |
| H — Performance and accessibility | 5 |
| I — Tests | 10 |
| Code quality (general rules Q1–Q5) | 5 |

Passing grade: 70. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
