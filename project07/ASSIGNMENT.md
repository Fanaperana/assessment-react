# Project 07 — TripPlanner 🧳 (Vue 3 + Nuxt)

Build **TripPlanner**, an app to plan trips day by day, with **Vue 3** and **Nuxt**.

You know React. This project teaches the **Vue way** — Single-File Components, reactivity with `ref` / `computed`, `v-model`, slots, composables — and **Nuxt**: file-based routing, SSR, server routes (Nitro), and data fetching with `useFetch`.

- **Level:** Intermediate → Advanced (new framework)
- **Suggested time:** 3 weeks
- **Free APIs (no key):** [Open-Meteo](https://open-meteo.com/) for weather and geocoding, [OpenStreetMap tiles](https://wiki.openstreetmap.org/wiki/Tile_usage_policy) for the map (respect the usage policy).

---

## 1. What you are building

A user can:

1. Sign in (simple email + password, sessions in a cookie).
2. Create a trip: name, destination (search a city with autocomplete), dates, cover color.
3. See the trip as a list of **days**. Each day has **activities** (time, title, place, cost, notes, category).
4. Reorder activities by drag and drop inside a day and between days.
5. See all activities with a location on a **map**.
6. See the **weather forecast** for the trip dates and destination.
7. Track a **budget**: total, per category, per day, in the trip currency.
8. Share a read-only trip link (`/share/[token]`) that works without sign-in.

---

## 2. Rules

- ✅ Nuxt (latest) + Vue 3 + TypeScript (already set up). Use the **Composition API** with `<script setup lang="ts">`. No Options API.
- ✅ **Pinia** for client state. **Nuxt server routes** (`server/api/`) for the back end.
- ✅ Persistence: Nitro **storage** (`useStorage`, file system driver) **or** SQLite with Drizzle. Your choice — explain it in the PR.
- ✅ Allowed modules: `@pinia/nuxt`, `@nuxt/ui` or Tailwind, `@nuxt/test-utils`, `nuxt-auth-utils`, `@vueuse/nuxt`, `@nuxt/image`, `@nuxt/eslint`. A map library (Leaflet / MapLibre).
- ❌ No React. No Vuex.

---

## 3. Requirements

### Part A — Vue fundamentals

- **A1** Components with typed `defineProps`, `defineEmits` and `defineModel` (at least one custom `v-model` component, for example `<MoneyInput v-model="cost" />`).
- **A2** Use **slots** (default, named and scoped) in a reusable `<DataList>` or `<Card>` component.
- **A3** `provide` / `inject` with a typed `InjectionKey` for the current trip.
- **A4** `<Transition>` / `<TransitionGroup>` for list changes, respecting `prefers-reduced-motion`.
- **A5** Write at least **4 composables** (`useTrip`, `useBudget`, `useWeather`, `useGeocoding`, …) with clear inputs and outputs.

### Part B — Nuxt routing and layouts

- **B1** File-based routes: `/`, `/trips`, `/trips/[id]`, `/trips/[id]/days/[day]`, `/trips/[id]/budget`, `/share/[token]`, `/login`.
- **B2** Layouts: `default` and `auth`. Error page `error.vue`.
- **B3** Route middleware `auth.ts` that protects trip pages (client **and** server side).

### Part C — Data fetching and SSR

- **C1** Use `useFetch` / `useAsyncData` with stable keys. No double fetching between server and client (check the network panel).
- **C2** Trip pages render on the server (SSR). The map is a client-only component (`<ClientOnly>` or `.client.vue`).
- **C3** Loading and error states for every fetch. `refresh()` after mutations, or update Pinia optimistically.

### Part D — Server routes (Nitro)

- **D1** REST endpoints under `server/api/` for trips, days, activities and share links.
- **D2** Validate every request body with Zod (`readValidatedBody`). Return proper status codes with `createError`.
- **D3** Authorization on every endpoint: a user only reads and writes their own trips. The share endpoint is read-only.
- **D4** Proxy the Open-Meteo calls through a server route with caching (`defineCachedEventHandler`, 1 hour).

### Part E — State (Pinia)

- **E1** A `trips` store (setup-store syntax) with getters for budget totals and actions for mutations.
- **E2** Optimistic reorder of activities with rollback on error.
- **E3** Undo for "delete activity" (toast with Undo for 5 seconds).

### Part F — Features

- **F1** City autocomplete (debounced, keyboard accessible, aborts old requests).
- **F2** Drag-and-drop reorder of activities (a library like `vue-draggable-plus` is allowed here).
- **F3** Map with markers for every activity. Clicking a marker highlights the activity.
- **F4** Budget page: per-category breakdown chart (your own SVG or a chart library), currency formatting with `Intl`.

### Part G — SEO and accessibility

- **G1** `useHead` / `useSeoMeta` on every page. The share page has Open Graph tags.
- **G2** Keyboard-accessible forms, dialogs and drag and drop (an alternative "Move up / down" control).

### Part H — Testing

- **H1** Vitest unit tests for composables and Pinia stores.
- **H2** Component tests with `@nuxt/test-utils` (`mountSuspended`) for at least 4 components.
- **H3** Server route tests (`$fetch` with `setup()` from `@nuxt/test-utils/e2e`) for authorization rules.
- **H4** Playwright: sign in → create trip → add two activities → reorder → open share link in a new context.
- **H5** At least **30** tests.

---

## 4. Bonus (up to +15)

- **X1** Export a trip as PDF or `.ics` calendar file.
- **X2** Collaborators: invite another user to edit a trip.
- **X3** PWA with offline read access (`@vite-pwa/nuxt`).
- **X4** Deploy to Vercel, Netlify or NuxtHub.
- **X5** Write a short comparison in the PR: Vue reactivity vs React state, with two code examples from your project.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Vue fundamentals and composables | 15 |
| B — Nuxt routing, layouts, middleware | 10 |
| C — Data fetching and SSR | 10 |
| D — Server routes, validation, authorization | 15 |
| E — Pinia, optimistic updates, undo | 10 |
| F — Features (autocomplete, DnD, map, budget) | 15 |
| G — SEO and accessibility | 5 |
| H — Tests | 15 |
| Code quality (Q1–Q5) | 5 |

Passing grade: 70. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
