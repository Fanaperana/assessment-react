# Project 02 — FlowBoard

React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui starter for the FlowBoard assignment.

👉 **Read [ASSIGNMENT.md](ASSIGNMENT.md) first**, then [API.md](API.md) for the mock backend.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Commands

```bash
npm install          # install dependencies (run once)
npm run dev          # start the dev server at http://localhost:5173
npm test             # run all tests once
npm run test:watch   # run tests in watch mode
npm run lint         # check the code with oxlint
npm run format       # format all files with Prettier
npm run format:check # check formatting (CI runs this)
npm run build        # type-check and build for production
npm run preview      # preview the production build
```

Add shadcn/ui components with:

```bash
npx shadcn@latest add dialog card input
```

## What is already set up

- Vite + React 19 + TypeScript (strict), path alias `@/` → `src/`
- Tailwind CSS v4 (`@tailwindcss/vite`) with the shadcn theme in `src/index.css`
- shadcn/ui (Radix base, `components.json`), with `Button` installed
- Prettier with `prettier-plugin-tailwindcss` (sorts Tailwind classes)
- Oxlint
- Vitest + React Testing Library + jest-dom
- Mock REST API with MSW, in the browser (`src/main.tsx`) and in tests (`src/test/setup.ts`)
- API types in `src/types/api.ts`
- Example tests: `src/App.test.tsx`, `src/mocks/handlers.test.ts`

Everything else is your job. 💪
