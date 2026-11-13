# Project 11 — InventoryPro 📦 (Angular)

Build **InventoryPro**, an inventory and purchase-order app for a small shop, with **Angular**.

Angular is the enterprise framework: TypeScript first, dependency injection, a strong router, typed reactive forms and RxJS. Modern Angular adds **signals**, **standalone components**, the new **control flow** (`@if`, `@for`, `@defer`) and **zoneless** change detection. This project uses all of them.

- **Level:** Advanced (new framework)
- **Suggested time:** 3 weeks
- **Back end:** a fake REST API with **json-server** (`npm i -D json-server`). You write `db.json` with seed data (≥ 50 products, 5 suppliers, 3 warehouses). Or use your Project 10 skills and build a tiny API — your choice.

---

## 1. What you are building

1. **Products**: SKU, name, category, price, cost, supplier, image, minimum stock. A data table with sorting, filtering and pagination.
2. **Stock**: quantity per warehouse. Stock **movements** (in, out, transfer, adjustment) with a reason and a history.
3. **Low-stock alerts**: products below their minimum, with a button to create a purchase order.
4. **Purchase orders**: a form with dynamic order lines, totals and tax, statuses (`draft → sent → received`). Receiving an order adds the stock.
5. **Dashboard**: stock value, low-stock count, top moving products, a chart of movements per week.
6. **Roles**: `viewer` (read only), `manager` (everything).

---

## 2. Rules

- ✅ Angular (latest) + TypeScript strict (already set up). **Standalone components only** (no `NgModule`).
- ✅ **Signals** for component and service state (`signal`, `computed`, `effect`, `linkedSignal`, `input()`, `output()`, `model()`). RxJS where streams fit (HTTP, typeahead).
- ✅ New control flow (`@if`, `@for` with `track`, `@switch`, `@defer`). No `*ngIf` / `*ngFor`.
- ✅ Allowed: Angular Material / CDK **or** PrimeNG **or** Tailwind, `json-server`, a chart library (or your own SVG).
- ❌ No NgRx (signals and services are enough here). No `any`.

---

## 3. Requirements

### Part A — Architecture

- **A1** Feature folders: `products/`, `stock/`, `orders/`, `dashboard/`, `core/` (auth, interceptors, layout), `shared/` (UI components, pipes).
- **A2** **Lazy-loaded** routes per feature (`loadComponent` / `loadChildren`).
- **A3** Services with `inject()` and `providedIn: 'root'`. A typed `ApiService` or one data service per resource.
- **A4** **Zoneless** change detection (`provideZonelessChangeDetection()`) and `OnPush` everywhere.

### Part B — Signals and state

- **B1** A `ProductStore` service with signals: list, filters, sort, page, `loading`, `error`, and `computed` derived values.
- **B2** Use `httpResource()` / `resource()` (or `toSignal`) for at least two data loads.
- **B3** `linkedSignal` for a value that resets when its source changes (for example the page number when a filter changes).
- **B4** Use `effect()` only for side effects (saving filters to `localStorage`). Explain each one.

### Part C — Routing

- **C1** Routes with parameters (`/products/:id`), **resolvers** and **component input binding** (`withComponentInputBinding()`).
- **C2** **Guards**: `authGuard` (signed in), `roleGuard` (manager only), and a `canDeactivate` guard for unsaved forms.
- **C3** Filters and page live in **query params**.

### Part D — Forms

- **D1** **Typed reactive forms** (`FormGroup<{...}>`, `NonNullableFormBuilder`) for product and purchase order.
- **D2** Custom validators: SKU format, price ≥ cost (cross-field), and an **async validator** that checks the SKU is unique.
- **D3** Purchase order lines with **`FormArray`**: add / remove lines, totals update live.
- **D4** Error messages under each field, shown on touch/submit. A reusable `<app-field-error>` component.

### Part E — HTTP and RxJS

- **E1** **Interceptors** (functional): add the auth header, show a global loading bar, and turn HTTP errors into toasts.
- **E2** Product search **typeahead** with `debounceTime`, `distinctUntilChanged` and `switchMap` (old requests are cancelled).
- **E3** Retry failed GET requests once (`retry({ count: 1, delay })`).
- **E4** Receiving a purchase order creates stock movements **and** updates quantities. Handle partial failure (explain your approach).

### Part F — UI

- **F1** Data table with sorting, filtering, pagination (CDK table / Material table or your own).
- **F2** A reusable **confirm dialog** service (`ConfirmService.ask(...) → Promise<boolean>`).
- **F3** `@defer (on viewport)` for the dashboard chart with a placeholder.
- **F4** Custom **pipes** (`currency` with the shop currency, `stockStatus`) and one **directive** (for example `appHasRole="manager"`).
- **F5** Responsive layout with a side nav that collapses on small screens.

### Part G — Accessibility and i18n

- **G1** Keyboard navigation in the table and dialogs, labels for all inputs, focus management after navigation.
- **G2** Angular **i18n** (`$localize`) for UI text, with one extra language.

### Part H — Testing

- **H1** Unit tests for the store, validators, pipes and interceptors (`HttpTestingController`).
- **H2** Component tests for the product form and the order form (with `TestBed` and harnesses if you use Material).
- **H3** Playwright: sign in as manager → create a product → create and receive a purchase order → stock increases.
- **H4** At least **40** tests.

---

## 4. Bonus (up to +15)

- **X1** Server-side rendering with `@angular/ssr` and hydration (incremental hydration with `@defer`).
- **X2** Barcode scanning with the camera (`BarcodeDetector` API) to find a product.
- **X3** Export the stock report as CSV and print a purchase order as PDF.
- **X4** Replace json-server with a NestJS API from Project 10.
- **X5** Signal forms (experimental) for one form, with a short comparison.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Architecture, lazy routes, DI, zoneless | 10 |
| B — Signals and state | 20 |
| C — Routing, resolvers, guards, query params | 10 |
| D — Typed reactive forms and validators | 15 |
| E — HTTP, interceptors, RxJS | 15 |
| F — UI components, pipes, directive, `@defer` | 10 |
| G — Accessibility and i18n | 5 |
| H — Tests | 10 |
| Code quality (Q1–Q5) | 5 |

Passing grade: 70. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
