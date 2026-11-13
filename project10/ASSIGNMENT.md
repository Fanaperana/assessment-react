# Project 10 — ShortLink API 🔗 (NestJS + PostgreSQL)

Build **ShortLink**, a production-style **URL shortener API** with analytics, using **NestJS**, **PostgreSQL** and **Prisma**.

There is no UI in this project (a Swagger page is your UI). It teaches back-end architecture in TypeScript: modules, dependency injection, guards, pipes, interceptors, authentication with access and refresh tokens, database migrations, caching, rate limiting, Docker, and real end-to-end tests.

- **Level:** Advanced
- **Suggested time:** 3 weeks
- **Needs:** Docker (for PostgreSQL and Redis).

---

## 1. What you are building

- Users **register** and **log in**. They get a short-lived **access token** and a **refresh token**.
- A user creates short links: `POST /links { url, alias?, expiresAt? }` → `https://sho.rt/abc123`.
- `GET /:code` **redirects** (302) to the long URL and records a **click** (time, referrer, user agent, device type).
- Users list, update, disable and delete their links, with **cursor pagination** and search.
- Users see **analytics**: clicks per day, top referrers, devices, for a date range.
- Admins can see all links and block a domain.

---

## 2. Rules

- ✅ NestJS + TypeScript strict (already set up).
- ✅ **Prisma** + **PostgreSQL** (Docker Compose). Migrations committed.
- ✅ Allowed: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport` (optional), `@nestjs/throttler`, `@nestjs/swagger`, `@nestjs/terminus`, `@nestjs/cache-manager` (+ Redis store), `class-validator` / `class-transformer` **or** `nestjs-zod`, `argon2`, `helmet`, `nanoid`, `pino` / `nestjs-pino`.
- ❌ No `any`. No business logic in controllers.
- ❌ Never log passwords, tokens or full IP addresses.

---

## 3. Requirements

### Part A — Architecture

- **A1** Feature modules: `AuthModule`, `UsersModule`, `LinksModule`, `RedirectModule`, `AnalyticsModule`, `HealthModule`, `PrismaModule` (global).
- **A2** Controllers only map HTTP to services. Services hold the logic. Repositories (or Prisma calls in services) are injected — no `new` for dependencies.
- **A3** `ConfigModule` with a validated environment schema. The app refuses to start with a missing or wrong variable.
- **A4** A global exception filter that returns one error format: `{ statusCode, error, message, requestId }`.
- **A5** An interceptor that adds a `requestId` to every log line and response header.

### Part B — Data

- **B1** Prisma schema: `User`, `RefreshToken`, `Link`, `Click`, `BlockedDomain`. Correct relations, `onDelete` rules and indexes (`code` unique, `(linkId, createdAt)` index).
- **B2** Migrations with `prisma migrate`. A seed script with demo users, links and 5 000 clicks.
- **B3** Short codes: 7 characters with `nanoid` (custom alphabet without look-alike characters). Retry on collision.

### Part C — Authentication and authorization

- **C1** Register / login with **argon2** password hashing.
- **C2** Access token (15 min, JWT) + refresh token (7 days, stored **hashed** in the database, **rotated** on every refresh). Reusing an old refresh token revokes the whole family.
- **C3** `POST /auth/logout` revokes the refresh token.
- **C4** A `JwtAuthGuard`, a `RolesGuard` with a `@Roles('admin')` decorator, and a `@CurrentUser()` param decorator.
- **C5** Users can only read and change **their own** links (404 for others).

### Part D — Links and redirects

- **D1** Validate URLs (only `http` / `https`, max 2 048 characters, not a blocked domain, not a link to the shortener itself).
- **D2** Custom aliases: 3–30 characters, letters, numbers and `-`. Reserved words (`api`, `docs`, `health`, …) are rejected.
- **D3** `GET /:code` redirects with 302. Expired or disabled links return **410 Gone**. Unknown codes return 404.
- **D4** The redirect is **fast**: cache `code → url` in Redis (or in memory) and record the click **after** the response (a queue or a fire-and-forget promise with error logging).
- **D5** Cursor pagination on `GET /links` (`?cursor=&limit=`) with search by URL or alias.

### Part E — Analytics

- **E1** `GET /links/:id/stats?from=&to=` → total clicks, clicks per day (fill days with 0), top 5 referrers, device types.
- **E2** Use database aggregation (`groupBy` or a raw **parameterised** query), not JavaScript loops over all clicks.
- **E3** Parse the user agent into a device type (`desktop`, `mobile`, `tablet`, `bot`). Do not count bots.

### Part F — Security and operations

- **F1** `helmet`, CORS for a configured origin list, and a body size limit.
- **F2** Rate limits: 10 link creations per minute per user, 5 login attempts per minute per IP, 100 redirects per minute per IP.
- **F3** `GET /health` with Terminus: database and Redis checks.
- **F4** Structured JSON logs (`pino`) with log levels from the environment.
- **F5** Graceful shutdown (`enableShutdownHooks`).

### Part G — Documentation

- **G1** Swagger at `/docs` with DTOs, examples, auth (Bearer) and error responses for every endpoint.
- **G2** A `README` section: how to run locally, environment variables, and an architecture diagram (Mermaid is fine).

### Part H — Docker

- **H1** A **multi-stage** `Dockerfile` (build → small runtime image, non-root user).
- **H2** `docker compose up` starts the API, PostgreSQL and Redis. Migrations run on start.

### Part I — Testing

- **I1** Unit tests for services with mocked dependencies (Vitest + `Test.createTestingModule`).
- **I2** **E2E tests** with `supertest` against a real PostgreSQL test database (Docker or **Testcontainers**): auth flow incl. refresh-token reuse, link CRUD, redirect + click, stats, authorization.
- **I3** At least **40** tests. Coverage ≥ 80% for services.

---

## 4. Bonus (up to +15)

- **X1** QR code endpoint (`GET /links/:id/qr.png`).
- **X2** Background jobs with **BullMQ** for click processing.
- **X3** OpenTelemetry tracing.
- **X4** Deploy the Docker image (Fly.io, Railway, Render) with a managed database.
- **X5** A tiny React or Angular dashboard for the stats (reuse your earlier skills).

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Architecture, config, errors, request IDs | 15 |
| B — Prisma schema, migrations, seed | 10 |
| C — Auth with refresh-token rotation, guards | 20 |
| D — Links, validation, fast redirects, pagination | 15 |
| E — Analytics with DB aggregation | 10 |
| F — Security and operations | 10 |
| G — Swagger and docs | 5 |
| H — Docker | 5 |
| I — Unit + E2E tests | 5 |
| Code quality (Q1–Q5) | 5 |

Passing grade: 70. Tests are also checked in parts A–F: a feature without tests loses points. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
