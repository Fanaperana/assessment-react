# Project 12 — PulseChat 💬 (Capstone: Go + WebSockets + React)

Build **PulseChat**, a real-time team chat (like a small Slack), with a **Go** API, **WebSockets**, **PostgreSQL** and a **React** client.

This is the **capstone**. It brings everything together — React skills from Projects 01–02, back-end skills from Projects 04 and 10, real time from Project 08 — and adds **Go**: a small, fast, typed language with built-in concurrency (goroutines and channels).

- **Level:** Expert
- **Suggested time:** 4–5 weeks
- **Starter:** `server/` (Go standard library HTTP server + test), `web/` (React + Vite + TypeScript), `docker-compose.yml` (PostgreSQL).
- **Before you start:** do the [Tour of Go](https://go.dev/tour/) and read [Effective Go](https://go.dev/doc/effective_go).

---

## 1. What you are building

- Users sign up and sign in.
- Users create **channels** (public or private) and join public channels. Channel owners invite users to private channels.
- Users send **messages** in real time. Messages support Markdown (bold, code, links) and **edit / delete**.
- Users see who is **online**, who is **typing**, and **unread counts** per channel.
- Users scroll up to load **older messages** (infinite scroll).
- Users **react** to messages with emoji and reply in **threads**.
- Users get a **mention** notification when someone writes `@their-name`.

---

## 2. Rules

### Server (Go)

- ✅ Go (latest stable). Standard library `net/http` routing (Go 1.22+ patterns) **or** `chi`.
- ✅ PostgreSQL with `pgx`. SQL with **sqlc** (generated, typed queries) or hand-written SQL with `pgx`. Migrations with `goose` or `golang-migrate`.
- ✅ WebSockets with `github.com/coder/websocket` (or `gorilla/websocket`).
- ✅ Allowed: `golang-jwt/jwt` or your own signed cookies, `golang.org/x/crypto/bcrypt` (or argon2), `log/slog`, `testify` (optional), `testcontainers-go`.
- ❌ No ORM (GORM, ent). Write SQL — it is part of the learning.
- ❌ No global mutable state outside the hub. No `panic` for normal errors.

### Client (React)

- ✅ React + TypeScript + Vite (already set up). Tailwind + shadcn/ui, React Router, and **TanStack Query** are allowed now (you earned it).
- ❌ No chat SDKs (Stream, Sendbird, Firebase, Supabase Realtime, Socket.IO).

---

## 3. Requirements

### Part A — Go project structure

- **A1** Layout: `cmd/api/` (main), `internal/httpapi/` (handlers, middleware), `internal/chat/` (hub, clients), `internal/store/` (database), `internal/auth/`, `migrations/`.
- **A2** Configuration from environment variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`) with validation at start-up.
- **A3** Middleware: request ID, structured logging with `slog`, panic recovery, CORS, auth.
- **A4** Graceful shutdown (already in the starter): close WebSocket connections cleanly and wait for in-flight requests.
- **A5** Errors are wrapped with context (`fmt.Errorf("...: %w", err)`) and mapped to HTTP status codes in one place.

### Part B — Database

- **B1** Tables: `users`, `channels`, `channel_members` (with `last_read_message_id`), `messages` (with `parent_id` for threads, `edited_at`, `deleted_at`), `reactions`.
- **B2** Migrations, indexes for every hot query, foreign keys, and a seed command.
- **B3** **Keyset (cursor) pagination** for message history: `GET /channels/{id}/messages?before={messageId}&limit=50`.
- **B4** Use transactions where two writes must succeed together.

### Part C — REST API

- **C1** Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /me`. Passwords hashed. Token in an **HTTP-only, Secure, SameSite** cookie.
- **C2** Channels: list, create, join, leave, invite, members.
- **C3** Messages: history, edit (author only, within 15 minutes), soft delete (author or channel owner).
- **C4** Reactions: add / remove. Threads: list replies.
- **C5** Validate all input and return a consistent JSON error: `{ "error": { "code": "...", "message": "..." } }`.

### Part D — Real time (WebSockets + concurrency)

- **D1** `GET /ws` upgrades to a WebSocket after checking the auth cookie **and** the `Origin` header.
- **D2** A **hub** goroutine owns the room membership maps. Clients talk to it only through **channels** (no shared maps with mutexes in handlers). Explain the design in the PR with a diagram.
- **D3** Each client has a read goroutine and a write goroutine, a buffered send channel, **ping/pong** heartbeats, and is dropped if it is too slow (backpressure).
- **D4** Events (JSON, versioned type field): `message.created`, `message.updated`, `message.deleted`, `reaction.changed`, `typing`, `presence`, `read.updated`.
- **D5** Messages are saved to the database **before** they are broadcast. The client sends a `clientId` so it can match its optimistic message with the saved one.
- **D6** Rate-limit messages per user (for example 5 per second, token bucket from `golang.org/x/time/rate`).

### Part E — React client

- **E1** Layout: channel sidebar with unread badges, message list, composer, thread panel, member list with online dots.
- **E2** A WebSocket client module with **automatic reconnect** (exponential backoff + jitter), a connection status banner, and **resync** of missed messages after reconnect.
- **E3** **Optimistic send**: the message appears at once as "sending", then becomes "sent" or "failed — retry".
- **E4** Infinite scroll upward that **keeps the scroll position** when older messages load. Auto-scroll down only when the user is already at the bottom.
- **E5** Typing indicator ("Sam is typing…"), throttled to one event per 2 seconds.
- **E6** Unread counts and a "New messages" divider based on `last_read_message_id`.
- **E7** Markdown rendering **without XSS** (no raw HTML).

### Part F — Testing

- **F1** Go: table-driven unit tests, `httptest` handler tests, and store tests against a real PostgreSQL (**testcontainers-go** or the compose database).
- **F2** Go: a WebSocket integration test with two clients: one sends, the other receives.
- **F3** `go test -race ./...` passes. `go vet` and `staticcheck` (or `golangci-lint`) pass.
- **F4** React: tests for the WebSocket client reconnect logic (fake timers) and the message list reducer.
- **F5** Playwright: two users in two browser contexts chat in real time.
- **F6** At least **40** Go tests and **20** front-end tests.

### Part G — Delivery

- **G1** A multi-stage `Dockerfile` for the server (final image based on `distroless` or `scratch`, non-root).
- **G2** `docker compose up` runs PostgreSQL, the API and the built web client (served by the Go server or nginx).
- **G3** A `README` with architecture diagram, how to run, and a short load-test result (for example `k6` with 200 WebSocket clients).

---

## 4. Bonus (up to +15)

- **X1** File and image uploads (S3-compatible storage, MinIO in compose) with previews.
- **X2** Horizontal scaling: two API instances that share events through **PostgreSQL `LISTEN/NOTIFY`** or Redis pub/sub.
- **X3** Full-text message search with PostgreSQL `tsvector`.
- **X4** Desktop app: wrap the client with **Tauri** (Project 05 skills) with native notifications.
- **X5** Deploy (Fly.io, Railway, a VPS with Caddy) with HTTPS and a custom domain.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Go structure, config, middleware, errors | 10 |
| B — Database, migrations, keyset pagination | 10 |
| C — REST API and auth | 10 |
| D — WebSockets, hub, concurrency, rate limiting | 25 |
| E — React client (reconnect, optimistic, scroll, unread) | 20 |
| F — Tests (incl. `-race`) | 15 |
| G — Docker and docs | 5 |
| Code quality (gofmt, linters, Q1–Q5) | 5 |

Passing grade: 75 (this is the capstone). The walk-through for this project is longer (about 45 minutes). See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
