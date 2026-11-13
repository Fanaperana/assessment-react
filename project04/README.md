# Project 04 — HelpDesk

Laravel 12 + Inertia 2 + React 19 + TypeScript + Tailwind CSS + shadcn/ui (official React starter kit).

👉 **Read [ASSIGNMENT.md](ASSIGNMENT.md) first.** It has the requirements and the grading.

## Get started

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # Windows: New-Item database/database.sqlite (PowerShell)
php artisan migrate --seed
npm install
composer run dev      # server + queue + logs + Vite on http://localhost:8000
```

## Checks (CI runs these on every pull request)

```bash
composer test
vendor/bin/pint --test
npm run types
npm run lint:check
npm run format:check
npm run build
```

## Notes

- Needs PHP 8.3+ (with `pdo_sqlite`, `mbstring`, `fileinfo`), Composer 2 and Node.js.
- Format PHP with `vendor/bin/pint`.
- Recommended Node.js version for all projects: **24 LTS**.

The starter was created with the official CLI. Everything else is your job. 💪

## HelpDesk implementation notes

- Tickets use Eloquent relationships, backed enums, policies and Form Requests. Every write is performed through `TicketService`, which records a `ticket_activities` row and dispatches queued database/mail notifications.
- The composite index on `tickets(assignee_id, status)` supports the agent dashboard's assigned-open query without scanning every ticket. The other filter/sort columns have dedicated indexes too.
- Attachments are stored on the private disk and are only downloaded through the policy-protected controller. API resources filter internal notes for customers.
- `tickets:check-sla` is scheduled every 15 minutes. Urgent, high, normal and low tickets receive 4-hour, 24-hour, 72-hour and 120-hour targets respectively; breaches persist in `tickets.sla_breached_at` and the activity log.
- The API is protected by Sanctum and the named `api` limiter allows 60 requests per minute per token.

## Required checks

```bash
composer test
vendor/bin/pint --test
npm run types
npm run lint:check
npm run format:check
npm run build
```

The project requires PHP 8.3+ with `pdo_sqlite`, `mbstring` and `fileinfo`. Run `php artisan migrate --seed` before trying the app. `php artisan test --coverage` produces the optional coverage report for the PR.
