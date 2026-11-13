# Project 04 — HelpDesk 🎫 (Laravel + Inertia React)

Build **HelpDesk**, a support-ticket system, with **Laravel 12** on the back end and **React (Inertia)** on the front end.

You already know React well. This project teaches the **back end**: database design, Eloquent, authorization, validation, queues, mail, file storage, an API and server-side testing — the Laravel way.

- **Level:** Advanced (new language: PHP)
- **Suggested time:** 3–4 weeks
- **Starter:** the official Laravel React starter kit (Inertia 2, React 19, TypeScript, Tailwind, shadcn/ui, auth pages already built).

---

## 1. What you are building

There are three roles:

| Role | Can do |
| --- | --- |
| **Customer** | Open tickets, see **only their own** tickets, reply, attach files, close their ticket. |
| **Agent** | See all tickets, assign a ticket to themselves, change status and priority, reply publicly or with an **internal note** (customers never see notes). |
| **Admin** | Everything an agent can do + manage users and roles, categories, and see reports. |

A ticket has a subject, description, category, priority (`low`, `normal`, `high`, `urgent`), status (`open`, `pending`, `resolved`, `closed`), an assignee, replies, attachments and an activity log.

---

## 2. Rules

- ✅ Laravel 12, PHP 8.3+, Inertia + React + TypeScript (already set up). SQLite locally is fine.
- ✅ Use **Eloquent**, **Form Requests**, **Policies**, **Enums**, **API Resources**, **Jobs**, **Notifications** and **Pest** — the Laravel features this project is about.
- ✅ `composer test` and `vendor/bin/pint --test` must pass. Front end: `npm run lint`, `npm run types`, `npm run build`.
- ❌ No admin-panel generators (Filament, Nova, Backpack). Build the pages yourself.
- ❌ No raw SQL strings with user input. Use the query builder / Eloquent.
- ❌ Never commit `.env`.

---

## 3. Requirements

### Part A — Database and models

- **A1** Migrations for `tickets`, `ticket_replies`, `categories`, `attachments`, `ticket_activities`, and a `role` column (or a roles table) on users.
- **A2** PHP **backed enums** for `TicketStatus`, `TicketPriority` and `Role`, cast on the models.
- **A3** Relationships: `User hasMany Ticket`, `Ticket belongsTo assignee`, `Ticket hasMany replies`, polymorphic `attachments` (for tickets **and** replies).
- **A4** Factories for every model and a `DatabaseSeeder` that creates 1 admin, 3 agents, 10 customers and 60 tickets with replies.
- **A5** Query scopes: `open()`, `assignedTo($user)`, `visibleTo($user)`, `search($term)`.

### Part B — Authorization

- **B1** A `TicketPolicy` with `viewAny`, `view`, `create`, `update`, `assign`, `reply`, `addInternalNote`, `close`.
- **B2** Use `$this->authorize()` / `Gate` in controllers **and** pass permissions to React (`can.update`, `can.assign`, …) so the UI hides actions the user cannot do.
- **B3** Customers get **404** (not 403) for tickets that are not theirs.
- **B4** An admin-only area protected by middleware.

### Part C — Validation and controllers

- **C1** Form Request classes for every write (`StoreTicketRequest`, `UpdateTicketRequest`, `StoreReplyRequest`, …).
- **C2** Resource controllers with thin methods. Put business rules in **Actions** or **Services** (for example `AssignTicket`, `ChangeTicketStatus`).
- **C3** Every change writes a row to `ticket_activities` ("Agent Sam changed status from open to pending").

### Part D — React pages (Inertia)

- **D1** Ticket list with **server-side** filters (status, priority, category, assignee, search), sorting and pagination. Filters stay in the URL (`preserveState`, `preserveScroll`).
- **D2** Ticket page: conversation timeline (replies, internal notes in a different color, activity entries), reply form with file upload and progress bar.
- **D3** Create-ticket form with Inertia `useForm`, validation errors from Laravel shown under each field.
- **D4** Agent dashboard: my open tickets, unassigned tickets, tickets close to SLA breach.
- **D5** Use shared Inertia data for the signed-in user, roles and flash messages (toasts).

### Part E — Performance

- **E1** No N+1 queries. Turn on `Model::preventLazyLoading()` in development and use eager loading (`with`, `withCount`).
- **E2** Indexes on the columns you filter and sort by. Explain one index in the PR.

### Part F — Queues, mail and scheduling

- **F1** Notifications (mail + database) when: a ticket is created (to agents), an agent replies (to the customer), a ticket is assigned (to the agent). Notifications are **queued** (`ShouldQueue`).
- **F2** Mail uses Markdown mailables. Show the mails in Mailpit or the `log` driver.
- **F3** A scheduled command `tickets:check-sla` runs every 15 minutes and marks tickets that breached their SLA (urgent 4 h, high 24 h, normal 72 h).
- **F4** An in-app notification bell with unread count (database notifications).

### Part G — Files

- **G1** Attachments: max 5 files, 10 MB each, only images, PDF and text. Store them on a **private** disk.
- **G2** Downloads go through a controller that checks the policy, or a **temporary signed URL**.

### Part H — REST API

- **H1** A token API with **Sanctum**: `GET /api/tickets`, `GET /api/tickets/{id}`, `POST /api/tickets`, `POST /api/tickets/{id}/replies`.
- **H2** Responses use **API Resources**, paginated, and never leak internal notes to customers.
- **H3** Rate limiting on the API (60 requests per minute per token).

### Part I — Testing (Pest)

- **I1** Feature tests for every policy rule (a customer cannot see another customer's ticket, cannot add an internal note, …).
- **I2** Validation tests with datasets.
- **I3** `Notification::fake()`, `Queue::fake()` and `Storage::fake()` tests for notifications, jobs and uploads.
- **I4** API tests with Sanctum (`Sanctum::actingAs`).
- **I5** At least **40** tests, all passing. Show the coverage report (`--coverage`) in the PR if you can.

---

## 4. Bonus (up to +15)

- **X1** Real-time updates with **Laravel Reverb** (new replies appear without reload).
- **X2** Reports page with charts: tickets per day, average first-response time, per-agent workload.
- **X3** Email piping: create a reply from an inbound email (a fake webhook endpoint is fine).
- **X4** Canned responses for agents with placeholders (`{customer_name}`).
- **X5** Deploy with Laravel Forge, Ploi or a Docker image (Laravel Sail / FrankenPHP).

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Database, models, enums, seeders | 15 |
| B — Authorization (policies) | 15 |
| C — Validation, controllers, actions, activity log | 10 |
| D — React pages with Inertia | 15 |
| E — Performance (no N+1, indexes) | 5 |
| F — Queues, mail, notifications, scheduler | 10 |
| G — Private file uploads | 5 |
| H — Sanctum API | 10 |
| I — Pest tests | 10 |
| Code quality (Pint, Q1–Q5) | 5 |

Passing grade: 70. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
