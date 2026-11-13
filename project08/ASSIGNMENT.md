# Project 08 — QuizArena 🏆 (SvelteKit)

Build **QuizArena**, a live multiplayer quiz game (like Kahoot), with **Svelte 5** and **SvelteKit**.

This project teaches a compiler-based framework with **runes** (`$state`, `$derived`, `$effect`, `$props`), SvelteKit's **load functions** and **form actions** with progressive enhancement, server hooks, and **real-time** updates with Server-Sent Events.

- **Level:** Advanced (new framework + real time)
- **Suggested time:** 3 weeks

---

## 1. What you are building

- A **host** signs in, creates quizzes (questions with 2–4 answers, one correct, a time limit), and starts a **live game**.
- The game shows a 6-digit **join code**. **Players** open `/play`, type the code and a nickname — no account needed.
- The host's screen shows the question. Players answer on their phone. Faster correct answers get more points.
- After each question, everyone sees the correct answer and the **live leaderboard**.
- At the end, a podium with the top 3, and the host can see per-question statistics.

---

## 2. Rules

- ✅ SvelteKit + Svelte 5 + TypeScript (already set up). Use **runes** only (no `export let`, no old `$:` reactive statements).
- ✅ Database: SQLite with **Drizzle** (`npx sv add drizzle`). Sessions: your own cookie sessions (`npx sv add lucia` guide) or Better Auth.
- ✅ Real time: **Server-Sent Events** from a `+server.ts` endpoint. (WebSockets are bonus X1.)
- ✅ Tailwind is allowed (`npx sv add tailwindcss`).
- ❌ No React, Vue or a UI kit that needs another framework.
- ❌ The client never decides the score. The server checks the answer and the time.

---

## 3. Requirements

### Part A — Svelte 5 fundamentals

- **A1** Components with typed `$props()`, `$bindable()` and snippets (`{#snippet}` / `{@render}`).
- **A2** `$state` for local state, `$derived` for computed values, `$effect` only for side effects (explain each `$effect` in a comment).
- **A3** Shared state in a `.svelte.ts` module (for example a class with `$state` fields) — no Svelte stores.
- **A4** Transitions and animations (`transition:fly`, `animate:flip` on the leaderboard), respecting `prefers-reduced-motion`.

### Part B — Routing and loading

- **B1** Routes: `/`, `/login`, `/quizzes`, `/quizzes/new`, `/quizzes/[id]/edit`, `/host/[gameId]`, `/play`, `/play/[code]`.
- **B2** `+page.server.ts` load functions for data that needs the database. `+layout.server.ts` passes the user.
- **B3** `+error.svelte` pages and typed `error()` / `redirect()` calls.

### Part C — Form actions

- **C1** Quiz create/edit, join game, and answer are **form actions** that work **without JavaScript** (test it with JS disabled), and use `use:enhance` for a better experience with JS.
- **C2** Validate with Zod (or Valibot). Return `fail(400, { errors, values })` and show errors next to fields, keeping the typed values.
- **C3** The quiz editor supports adding, removing and reordering questions and answers.

### Part D — Server, hooks and security

- **D1** `hooks.server.ts` reads the session cookie and puts the user in `event.locals` (typed in `app.d.ts`).
- **D2** Only the quiz owner can edit a quiz or host its game.
- **D3** Players get a signed, HTTP-only cookie for their game seat. A player cannot answer twice or for another player.
- **D4** Rate-limit join attempts by IP (simple in-memory limiter is fine).

### Part E — Real time

- **E1** `GET /api/games/[id]/events` streams SSE: `player_joined`, `question_started`, `answer_count`, `question_ended`, `leaderboard`, `game_over`.
- **E2** A server-side game engine (`src/lib/server/game/`) holds the game state machine: `lobby → question → reveal → … → finished`. Transitions are pure functions with tests.
- **E3** The client reconnects automatically (`EventSource`) and gets the current state after reconnecting.
- **E4** The countdown is driven by the server's `startedAt` time, not a client timer alone.

### Part F — Game rules

- **F1** Score = `1000 × (1 − answerTime / timeLimit / 2)` for a correct answer, 0 otherwise. Streak bonus for 3+ correct answers in a row.
- **F2** The host can skip a question, pause, and kick a player.
- **F3** Results page: per-question percentage correct and average answer time.

### Part G — UX and accessibility

- **G1** The player view is designed for phones: big answer buttons with shapes and colors (not color alone).
- **G2** Live regions announce "Correct!", "Time's up" and the player's rank.
- **G3** Works in light and dark mode.

### Part H — Testing

- **H1** Vitest unit tests for the game state machine and the score function (table-driven).
- **H2** Tests for form actions (call the action with a fake `RequestEvent`).
- **H3** Playwright with **two browser contexts**: the host starts a game, a player joins with the code, answers, and the leaderboard updates on both screens.
- **H4** At least **30** tests.

---

## 4. Bonus (up to +15)

- **X1** Replace SSE with WebSockets (with an adapter that supports them) and explain the trade-offs.
- **X2** Image questions (upload, resize on the server with `sharp`).
- **X3** Import a quiz from a CSV file.
- **X4** Deploy (Node adapter on Fly.io / Render, or Cloudflare with Durable Objects).
- **X5** A "team mode" where players join teams and scores add up.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Svelte 5 runes, snippets, shared state, animations | 15 |
| B — Routing, load functions, errors | 10 |
| C — Form actions with progressive enhancement | 15 |
| D — Hooks, sessions, authorization, rate limiting | 10 |
| E — Real time with SSE and the game state machine | 20 |
| F — Game rules and host controls | 10 |
| G — UX and accessibility | 5 |
| H — Tests | 10 |
| Code quality (Q1–Q5) | 5 |

Passing grade: 70. Add a short video of a game with two devices to the PR. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
