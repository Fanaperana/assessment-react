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
