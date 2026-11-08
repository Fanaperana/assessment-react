# Project 01 — ShopLite

React 19 + TypeScript + Vite starter for the ShopLite assignment.

👉 **Read [ASSIGNMENT.md](ASSIGNMENT.md) first.** It has all the requirements and the grading.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Commands

```bash
npm install        # install dependencies (run once)
npm run dev        # start the dev server at http://localhost:5173
npm test           # run all tests once
npm run test:watch # run tests in watch mode
npm run lint       # check the code with oxlint
npm run build      # type-check and build for production
npm run preview    # preview the production build
```

## What is already set up

- Vite + React 19 + TypeScript (strict)
- Oxlint for linting
- Vitest + React Testing Library + jest-dom (`src/test/setup.ts`)
- One example test: `src/App.test.tsx`
- Product types: `src/types/product.ts`

## Implementation notes

ShopLite has a product catalog, detail gallery, cart, checkout, order confirmation,
theme switcher, and a 404 page. Search, category, sort, and page are kept in the
URL so a catalog view can be bookmarked. The search field waits 400 ms before
updating the URL. DummyJSON has separate search and category endpoints; the
app fetches all search matches and applies the category, sorting, and 12-item
pages in the browser so these controls can be combined.

The cart uses a pure reducer and Context. The cart and chosen theme use
`localStorage`; without a stored theme, the system preference is used. Checkout
is a simulation: no form values are sent to a server. Use fake test values only.

`ProductCard` uses `memo`, and the catalog passes it a stable `useCallback`
handler. When a search or filter changes, cards with unchanged product props
do not need to rerender. This is the targeted performance choice for H1.

The tests mock `fetch`, including request cancellation and retry. Run
`npm run lint`, `npm test`, and `npm run build` before opening a PR.
