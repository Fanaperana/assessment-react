# Assessment — Full-Stack Developer Track

Hands-on projects, from React to full-stack, desktop and mobile. Each project lives in its own folder with a starter, a `README.md` (how to run it) and an `ASSIGNMENT.md` (requirements and grading).

## Projects

| # | Project | Stack | Main topics | Level | Time |
| --- | --- | --- | --- | --- | --- |
| 01 | [**ShopLite**](project01/) — online shop | React + TypeScript + Vite | components, hooks, Context + `useReducer`, routing, fetching, forms, tests | Intermediate | 2–3 wk |
| 02 | [**FlowBoard**](project02/) — Kanban board | React + Tailwind + shadcn/ui | architecture, drag and drop, optimistic updates, undo/redo, MSW, Playwright | Advanced | 3–4 wk |
| 03 | [**Bookshelf**](project03/) — reading tracker | **Next.js** (App Router) | Server Components, Server Actions, streaming, caching, Drizzle + SQLite, auth, SEO | Advanced | 3 wk |
| 04 | [**HelpDesk**](project04/) — support tickets | **Laravel** + Inertia React | Eloquent, policies, Form Requests, queues, mail, files, Sanctum API, Pest | Advanced | 3–4 wk |
| 05 | [**FocusNotes**](project05/) — desktop notes | **Tauri v2** + Rust + React | Rust commands, SQLite + FTS5, tray, global shortcuts, events, capabilities | Advanced | 4 wk |
| 06 | [**DevFolio**](project06/) — portfolio + blog | **Astro** | content collections, islands, MDX, images, i18n, Lighthouse 100 | Intermediate | 2 wk |
| 07 | [**TripPlanner**](project07/) — trip planner | **Vue 3 + Nuxt** | Composition API, composables, Pinia, SSR, Nitro server routes | Advanced | 3 wk |
| 08 | [**QuizArena**](project08/) — live quiz game | **SvelteKit** (Svelte 5) | runes, form actions, hooks, Server-Sent Events, game state machine | Advanced | 3 wk |
| 09 | [**HabitLoop**](project09/) — mobile habits | **Expo + React Native** | Expo Router, SQLite, notifications, gestures, Reanimated, SVG charts | Advanced | 3 wk |
| 10 | [**ShortLink API**](project10/) — URL shortener | **NestJS** + PostgreSQL + Prisma | modules, DI, guards, JWT refresh rotation, Redis cache, Swagger, Docker, e2e | Advanced | 3 wk |
| 11 | [**InventoryPro**](project11/) — inventory | **Angular** | signals, standalone, typed reactive forms, RxJS, interceptors, guards | Advanced | 3 wk |
| 12 | [**PulseChat**](project12/) — team chat (capstone) | **Go** + WebSockets + PostgreSQL + React | goroutines, channels, hub design, keyset pagination, reconnect, Docker | Expert | 4–5 wk |

**Recommended order:** 01 → 02 → 03 → 06 → 04 → 07 → 08 → 05 → 09 → 10 → 11 → 12.
Projects 03–11 are independent, so you may change the order with your mentor's approval. Project 12 comes last.

## What you need

- **Node.js 24 LTS** (all JavaScript projects) and Git
- **PHP 8.3+** and **Composer 2** (Project 04)
- **Rust** (stable) and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) (Project 05)
- **Expo Go** on your phone (Project 09)
- **Docker** (Projects 10 and 12)
- **Go 1.25+** (Project 12)

## General rules for every project

- **Q1 — Formatting and linting.** The project's formatter and linter pass (Prettier, ESLint/Oxlint, Pint, `cargo fmt` + `clippy`, `gofmt` + `go vet`).
- **Q2 — Small units.** No source file longer than about **200 lines** (generated files excluded). Split big components, controllers and services.
- **Q3 — Clean up.** Every timer, listener, subscription, request and connection is cleaned up when it is not needed anymore.
- **Q4 — Commits.** Small, focused commits that name the requirement ID, for example `feat(auth): rotate refresh tokens (C2)`.
- **Q5 — Secrets.** Never commit `.env` files, keys or passwords. Commit an `.env.example` instead.
- **Your own work.** You may read docs, articles and examples, and you may ask AI tools to **explain** things. Do not copy a full solution from the internet or from an AI. You must be able to explain every line you submit.
- **Walk-through.** After each review there is a short live session. You explain parts of your code and change something small. If you cannot explain your own code, the score goes down.
- **Scope.** Only change files inside the project folder you work on.

## How to submit your work

1. **Fork** this repository (button "Fork" at the top right of GitHub).
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/assessment-react.git
   cd assessment-react
   ```
3. **Update your fork** before each new project:
   ```bash
   git remote add upstream https://github.com/Fanaperana/assessment-react.git  # once
   git checkout main
   git pull upstream main
   git push origin main
   ```
4. **Create a branch** for the project:
   ```bash
   git checkout -b project03/<your-username>
   ```
5. **Read the project's `README.md`** to install and run it, then `ASSIGNMENT.md` for the requirements.
6. **Work in small steps** and commit often (rule Q4).
7. **Before you push**, run the checks listed in the project's `README.md`. CI runs the same checks on your pull request.
8. **Push** your branch and open a **Pull Request** to `main` of this repository. Fill in the PR template.
9. **Review:** answer the comments and push fixes to the same branch. For fixes after a merge, open a new branch `projectNN/<your-username>-fixes`.

You may open a **draft PR** early to ask questions or get feedback on your architecture.

## Useful links

- React: [react.dev](https://react.dev/learn) · Next.js: [nextjs.org/docs](https://nextjs.org/docs) · Astro: [docs.astro.build](https://docs.astro.build)
- Laravel: [laravel.com/docs](https://laravel.com/docs) · Inertia: [inertiajs.com](https://inertiajs.com) · Pest: [pestphp.com](https://pestphp.com)
- Tauri: [v2.tauri.app](https://v2.tauri.app) · Rust Book: [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)
- Vue: [vuejs.org](https://vuejs.org) · Nuxt: [nuxt.com/docs](https://nuxt.com/docs) · Svelte: [svelte.dev/docs](https://svelte.dev/docs)
- Expo: [docs.expo.dev](https://docs.expo.dev) · NestJS: [docs.nestjs.com](https://docs.nestjs.com) · Angular: [angular.dev](https://angular.dev)
- Go: [go.dev/tour](https://go.dev/tour) · [Effective Go](https://go.dev/doc/effective_go)
