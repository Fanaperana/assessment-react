# Project 01 — ShopLite 🛒

Build **ShopLite**, a small online shop front-end with React and TypeScript.

The goal is not just to "make it work". The goal is to show that you understand **how React works**:
components, state, effects, data flow, routing, forms, performance and testing. Write code you could explain line by line.

- **Level:** Intermediate → Advanced
- **Suggested time:** 2–3 weeks
- **Data source:** [DummyJSON Products API](https://dummyjson.com/docs/products) (free, no API key)

---

## 1. What you are building

A user can:

1. Browse a list of products.
2. Search, filter by category, sort and paginate the list.
3. Open a product detail page.
4. Add products to a cart, change quantities and remove them.
5. Go through a checkout form with validation.
6. See an order confirmation page.
7. Switch between light and dark theme.

The cart and theme must survive a page reload.

---

## 2. Rules

- ✅ Use **React 19 + TypeScript** (already set up). No `any` unless you write a comment explaining why.
- ✅ Use **function components and hooks only**. No class components.
- ✅ You may install: `react-router` (required), and a CSS approach of your choice (CSS Modules, plain CSS, Tailwind).
- ❌ Do **not** use a state library (Redux, Zustand, MobX…). Use React's own tools: `useState`, `useReducer`, Context.
- ❌ Do **not** use a data-fetching library (React Query, SWR…). Write your own fetching hook. (Bonus task X4 lets you compare later.)
- ❌ Do **not** use a UI component library (MUI, Chakra, shadcn…). Build your own components.
- ❌ Do **not** use a form library (React Hook Form, Formik…). Build the validation yourself.

---

## 3. API endpoints you will need

| Purpose | Endpoint |
| --- | --- |
| List products (paginated) | `GET https://dummyjson.com/products?limit=12&skip=0` |
| Search | `GET https://dummyjson.com/products/search?q=phone` |
| Category list | `GET https://dummyjson.com/products/category-list` |
| Products in a category | `GET https://dummyjson.com/products/category/smartphones` |
| Sort | add `&sortBy=price&order=asc` to the list URL |
| One product | `GET https://dummyjson.com/products/1` |

TypeScript types for a product are in [`src/types/product.ts`](src/types/product.ts).

---

## 4. Requirements

Each requirement has an ID. Use these IDs in your commit messages and in your Pull Request checklist.

### Part A — Components and layout

- **A1** Create a `Layout` with a header (logo, nav links, cart badge with item count, theme toggle) and a footer. All pages render inside it.
- **A2** Create reusable components: `Button`, `ProductCard`, `Spinner`, `ErrorMessage`, `EmptyState`. Type their props with TypeScript interfaces.
- **A3** `Button` must support `variant` (`'primary' | 'secondary' | 'danger'`), `disabled` and all normal `<button>` props (hint: `ComponentProps<'button'>`).
- **A4** The layout must work on a phone (360px wide) and on desktop. Product grid: 1 column on phone, 2–4 on bigger screens.

### Part B — Routing (`react-router`)

- **B1** Routes:
  - `/` → product list
  - `/products/:id` → product detail
  - `/cart` → cart
  - `/checkout` → checkout form
  - `/order/success` → confirmation
  - `*` → a "404 Not Found" page
- **B2** Search text, category, sort and page number must be stored in the **URL query string** (for example `/?q=phone&category=smartphones&page=2`). Reload or share the URL → same results.
- **B3** A user cannot open `/checkout` when the cart is empty. Redirect them to `/cart`.
- **B4** Load the checkout page with `React.lazy` + `Suspense` (code splitting).

### Part C — Data fetching

- **C1** Write a custom hook `useFetch<T>(url)` that returns `{ data, error, isLoading }`.
- **C2** It must **cancel** the old request when the URL changes or the component unmounts (`AbortController`). No "state update on unmounted component" problems and no race conditions.
- **C3** Every page that fetches data shows a loading state, an error state (with a "Try again" button) and an empty state.
- **C4** Search input is **debounced** (≈400 ms). Write a `useDebounce` hook yourself.

### Part D — Product list and detail

- **D1** Product list shows 12 products per page with Previous / Next buttons and "Page X of Y".
- **D2** Category filter (dropdown) loaded from the API.
- **D3** Sort by price (asc/desc) and rating (desc).
- **D4** Product detail page: image gallery (click a thumbnail to change the big image), title, price, discount, rating, stock, description, "Add to cart" button with a quantity selector (min 1, max = stock).

### Part E — Cart (global state)

- **E1** Manage the cart with `useReducer` + Context. Actions at least: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`.
- **E2** The reducer is a **pure function** in its own file and has unit tests.
- **E3** Expose the cart through a custom hook `useCart()`. It throws a clear error if used outside the provider.
- **E4** Cart page: list items, change quantity, remove item, show subtotal, discount and total. Money values always show 2 decimals (use `Intl.NumberFormat`).
- **E5** Save the cart to `localStorage` and restore it on start. Write a `useLocalStorage` hook.

### Part F — Checkout form

- **F1** Fields: full name, email, phone, address, city, postal code, payment method (radio: card / cash on delivery).
- **F2** If "card" is selected, show card number, expiry (MM/YY) and CVC fields. If not, hide them and do not validate them.
- **F3** Validate on blur and on submit. Show an error message under each wrong field. Disable the submit button while "submitting".
- **F4** On submit, fake a request (`setTimeout` ~1 s), clear the cart and navigate to `/order/success` with an order number.
- **F5** The form must be accessible: every input has a `<label>`, errors are linked with `aria-describedby`, and focus moves to the first wrong field on submit.

> ⚠️ This is a fake shop. Never send form data anywhere. Use fake test values only.

### Part G — Theme

- **G1** Light / dark theme with a `ThemeContext`. Use CSS variables for colors.
- **G2** Default to the system preference (`prefers-color-scheme`), remember the user's choice in `localStorage`.

### Part H — Performance

- **H1** Use `useMemo` / `useCallback` / `memo` **only where it helps**. In your PR description, explain one place where you used it and why.
- **H2** Images use `loading="lazy"` and have `alt` text.
- **H3** No console errors or warnings in the browser (including React key warnings).

### Part I — Testing (Vitest + React Testing Library)

Already installed. Run with `npm test`.

- **I1** Unit tests for the cart reducer (every action).
- **I2** Unit test for `useDebounce` (use fake timers).
- **I3** Component test for `ProductCard` (renders data, "Add to cart" works).
- **I4** Component test for the checkout form (shows errors on empty submit; hides card fields for cash).
- **I5** Mock `fetch` in tests. Tests must not call the real API.
- **I6** At least **15 tests** in total, all passing.

---

## 5. Bonus (optional, for extra points)

- **X1** Wishlist page (another Context, saved in `localStorage`).
- **X2** "Recently viewed" products on the home page (last 5).
- **X3** Error Boundary that catches render errors and shows a friendly page.
- **X4** Make a second branch where you replace `useFetch` with TanStack Query. In the PR, compare the two in 5–10 sentences.
- **X5** Deploy the app (Vercel / Netlify / GitHub Pages) and put the link in the PR.
- **X6** Use `useOptimistic` or `useTransition` somewhere it makes sense and explain why.

---

## 6. Suggested folder structure

You may change it, but keep it organised.

```
src/
  api/           # URL builders and fetch helpers
  components/    # reusable UI (Button, ProductCard, Spinner, ...)
  context/       # CartContext, ThemeContext
  hooks/         # useFetch, useDebounce, useLocalStorage, useCart
  pages/         # ProductListPage, ProductDetailPage, CartPage, ...
  reducers/      # cartReducer.ts (+ cartReducer.test.ts)
  types/         # shared TypeScript types
  utils/         # formatMoney, validators, ...
  App.tsx
  main.tsx
```

---

## 7. How you will be graded (100 points)

| Area | Points |
| --- | --- |
| Components, props, TypeScript types (Part A) | 10 |
| Routing and URL state (Part B) | 10 |
| Data fetching hooks, loading/error/empty states (Part C) | 15 |
| Product list and detail features (Part D) | 10 |
| Cart: reducer, context, persistence (Part E) | 15 |
| Checkout form: validation and accessibility (Part F) | 15 |
| Theme (Part G) | 5 |
| Performance and no console warnings (Part H) | 5 |
| Tests (Part I) | 10 |
| Code quality: names, small components, no dead code, clean commits | 5 |
| **Bonus (X1–X6)** | up to +15 |

**Passing grade:** 70 points. The CI checks (lint, tests, build) must be green, or the PR is not reviewed.

---

## 8. How to submit

See the [repository README](../README.md#how-to-submit-your-work) for the full steps. In short:

1. Fork the repository.
2. Create a branch `project01/<your-github-username>`.
3. Commit often, with clear messages (for example `feat(cart): add UPDATE_QUANTITY action (E1)`).
4. Open a Pull Request to `main`. Fill in the PR template checklist.
5. Answer the review comments and push fixes to the same branch.

Good luck — and have fun building it! 🚀
