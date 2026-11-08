# Project 02 — FlowBoard 📋

Build **FlowBoard**, a Kanban task board (like Trello) with React 19, TypeScript, **Tailwind CSS** and **shadcn/ui**.

Project 01 tested whether you can make React _work_. Project 02 tests whether you can **design** a React app:
small components with clear APIs, a clean state model, drag and drop built by hand, optimistic updates, undo, and real accessibility.

- **Level:** Advanced
- **Suggested time:** 3–4 weeks
- **Backend:** a mock REST API that runs in the browser. Read [API.md](API.md) first.

---

## 1. What you are building

A user can:

1. See all boards, create a board, rename it and delete it.
2. Open a board with columns (To do, In progress, …) and cards.
3. Add, rename, reorder and delete columns.
4. Add cards, open a card to edit its details, and delete it.
5. **Drag** cards between columns and inside a column, with the mouse, a finger, or the **keyboard**.
6. Filter cards by text, priority and label.
7. **Undo** and **redo** moves and deletes.
8. See changes immediately. When the server fails, the change rolls back and a toast explains what happened.
9. Switch between light and dark theme.

---

## 2. Rules

### Required tools

- ✅ **React 19 + TypeScript** (already set up). No `any` unless a comment explains why.
- ✅ **Tailwind CSS v4** for all styling (already set up).
  - Do not write new CSS files. `src/index.css` is only for the theme variables.
  - Use the `style` prop only for values that change at runtime (for example the position of a dragged card).
- ✅ **shadcn/ui** for UI primitives (already initialised, `Button` is installed). Add components with the CLI:

  ```bash
  npx shadcn@latest add card dialog input textarea select badge label
  ```

  You **must** use at least these shadcn components:
  `Button`, `Card`, `Dialog`, `AlertDialog`, `Input`, `Textarea`, `Label`, `Select`, `Badge`, `DropdownMenu`, `Skeleton`, `Sonner` (toasts), `Tooltip`.
  You may add others (`Popover`, `Calendar`, `Sheet`, `ScrollArea`, …).
  You may change the variants in `src/components/ui/*`. If you do, explain why in the PR.

- ✅ **React Router** (`react-router`) for routing.
- ✅ **Prettier** — `npm run format:check` must pass (CI checks it).

### Not allowed

- ❌ Drag-and-drop libraries (`@dnd-kit/*`, `react-beautiful-dnd`, `@hello-pangea/dnd`, `react-dnd`, `sortablejs`, …). You build drag and drop with **Pointer Events**.
- ❌ State libraries (Redux, Zustand, Jotai, MobX, …). Use `useReducer`, Context and React 19 hooks.
- ❌ Data-fetching libraries (TanStack Query, SWR, RTK Query, …).
- ❌ Form libraries (React Hook Form, Formik, …).
- ❌ Other UI kits (MUI, Chakra, Mantine, …). Use shadcn/ui and Tailwind.
- ❌ Changes to `src/mocks/` or `src/types/api.ts`.

Other packages: ask in a draft PR **before** you install them.

### Code quality rules (from the Project 01 review)

- **Q1** Prettier formatting everywhere (`npm run format:check`).
- **Q2** No file in `src/` longer than **200 lines** (except `src/components/ui/` and `src/mocks/`). Split big components.
- **Q3** Every timer, event listener and request is cleaned up when its component unmounts.
- **Q4** Small, focused commits with requirement IDs, for example `feat(dnd): keyboard move between columns (E4)`.

---

## 3. Requirements

### Part A — Architecture, Tailwind and shadcn/ui

- **A1** App shell: a header with the app name, a board switcher (`DropdownMenu`) and a theme toggle. Pages render below it.
- **A2** Feature-based folders, for example:

  ```
  src/
    api/                 # typed API client
    components/ui/       # shadcn components (generated)
    components/          # shared app components
    features/boards/     # boards list, board page, board reducer
    features/cards/      # card preview, card dialog, card forms
    features/dnd/        # drag-and-drop hooks and components
    features/history/    # undo / redo
    hooks/  lib/  test/  types/
  ```

- **A3** Build at least one **compound component** with Context, for example:

  ```tsx
  <Column column={column}>
    <Column.Header />
    <Column.Cards />
    <Column.AddCard />
  </Column>
  ```

- **A4** Responsive layout. On a phone (360 px), the columns scroll sideways with scroll snap and each column is almost the full width. On desktop, the columns sit side by side and the board scrolls sideways when needed.
- **A5** Dark mode with the Tailwind `dark` class and the shadcn theme variables. Follow the system setting until the user chooses a theme, then remember the choice. No flash of the wrong theme on load.

### Part B — Routing

- **B1** `/` — boards list: a grid of shadcn `Card`s with the column count and card count. Create a board in a `Dialog`, rename it, and delete it with an `AlertDialog`.
- **B2** `/boards/:boardId` — the board page.
- **B3** `/boards/:boardId/cards/:cardId` — opens the card `Dialog` **over** the board (a route-driven modal). A reload or a shared link opens the same card. Closing the dialog goes back to `/boards/:boardId`.
- **B4** Filters live in the URL: `?q=design&priority=high&label=dev`.
- **B5** A 404 page, and a "Board not found" state for an unknown board ID.

### Part C — Data layer and state

- **C1** API client in `src/api/`: one typed function per endpoint, and one shared `request<T>()` helper. On an error, it throws an `ApiError` class with `status` and `message`.
- **C2** Keep the board in a **normalized** shape in a reducer, for example:

  ```ts
  interface BoardState {
    board: Board
    columnOrder: string[]
    columns: Record<string, Column>
    cardIdsByColumn: Record<string, string[]>
    cards: Record<string, Card>
  }
  ```

  Write selectors (for example `selectVisibleCards(state, filters)`) as pure functions.

- **C3** Loading states use shadcn `Skeleton`s with the same shape as the real content. Errors show a message and a **Retry** button. Empty board and empty column have their own empty states.
- **C4** Requests are cancelled with `AbortController` when the page changes or unmounts.

### Part D — Columns and cards

- **D1** Add a column. Rename it inline: click the title, edit, **Enter** saves, **Escape** cancels. Delete it with an `AlertDialog` that says how many cards will be deleted.
- **D2** Quick "Add a card" form at the bottom of each column. **Enter** saves. The form stays open for the next card. **Escape** closes it.
- **D3** Card dialog: edit the title, description (`Textarea`), priority (`Select`), labels (add and remove, shown as `Badge`s) and due date. Delete the card from the dialog.
- **D4** Card preview on the board: title, priority badge (different color for each priority), labels, due date (red when the date has passed), and an icon when the card has a description.

### Part E — Drag and drop (built by hand)

- **E1** Drag cards inside a column and between columns with **Pointer Events**. It must work with a mouse and with touch. Show a placeholder where the card will drop.
- **E2** While dragging, a copy of the card follows the pointer. Render it in a **portal** (`createPortal` to `document.body`).
- **E3** Reorder columns by dragging the column header.
- **E4** Keyboard drag and drop: focus a card, **Space** picks it up, **arrow keys** move it (up/down in the column, left/right to other columns), **Space** drops it, **Escape** cancels. An `aria-live` region announces each step, for example _"Moved Write the About page to In progress, position 2 of 3."_
- **E5** Put the drag logic in custom hooks (for example `usePointerDrag`, `useKeyboardDrag`). Components only render.
- **E6** A drag must not start on a simple click. Use a small distance threshold (for example 5 px), so a click still opens the card.

### Part F — Optimistic updates and React 19

- **F1** Moves, edits and deletes show immediately (optimistic). The request runs in the background. If it fails, the change **rolls back** and a `Sonner` toast shows the error with a **Retry** action. Test it with `localStorage.setItem('flowboard:failRate', '0.5')`.
- **F2** Use `useActionState` with `<form action={...}>` for at least the "create board" and "add card" forms. Show the pending state in the submit button with `useFormStatus`.
- **F3** The text filter uses `useDeferredValue` (or `useTransition`), so typing stays smooth. Highlight the matching text in the card titles.
- **F4** Race conditions: when the user moves the same card twice quickly, the final state must be correct, even if the responses come back in a different order. Explain your solution in the PR.

### Part G — Undo and redo

- **G1** Undo and redo for card moves and card deletes: **Ctrl+Z** and **Ctrl+Shift+Z** (**⌘** on macOS), and an **Undo** action in the toast after a delete. Undo sends the API request that reverts the change.
- **G2** The history is a pure reducer (`past`, `present`, `future`) with tests.

### Part H — Accessibility and UX

- **H1** The whole app works with the keyboard only, with a visible focus ring.
- **H2** When the card dialog closes, focus goes back to the card that opened it (also with the route-driven modal).
- **H3** No errors or warnings in the browser console. Put a Lighthouse **Accessibility** score of 90 or more in the PR (screenshot).
- **H4** Animations respect `prefers-reduced-motion` (Tailwind `motion-safe:` / `motion-reduce:`).

### Part I — Testing

Vitest, React Testing Library and MSW are set up. Run with `npm test`.

- **I1** Unit tests for the board reducer and the history reducer.
- **I2** API client tests with MSW: success, `404`, `500` → `ApiError`.
- **I3** Component test with `user-event`: add a card and see it in the column.
- **I4** Rollback test: override a handler to return `500` (see [API.md](API.md)), move or edit a card, and check that it goes back and a toast appears.
- **I5** Keyboard drag test: Space, ArrowRight, Space → the API receives the correct `columnId` and `position`.
- **I6** One **Playwright** end-to-end test: create a board, add a column, add a card, move it, reload, and check that the card is still in the new column. Add a `test:e2e` script (CI runs it when it exists).
- **I7** At least **25** Vitest tests, all passing.

---

## 4. Bonus (optional, up to +15)

- **X1** Auto-scroll the board when you drag a card near the left or right edge.
- **X2** WIP limit per column (saved in `localStorage`): the column header turns red when it has too many cards.
- **X3** Select several cards (Shift+click) and drag them together.
- **X4** A column with 500 cards stays smooth: virtualize the list yourself (no library).
- **X5** Deploy the app (Vercel, Netlify or GitHub Pages; the mock API works in production too) and put the link in the PR.
- **X6** Storybook stories for three of your own components.

---

## 5. How you will be graded (100 points)

| Area                                                         | Points    |
| ------------------------------------------------------------ | --------- |
| A — Architecture, Tailwind, shadcn/ui, dark mode             | 10        |
| B — Routing and route-driven modal                           | 10        |
| C — API client, normalized state, loading/error/empty states | 15        |
| D — Columns and cards                                        | 10        |
| E — Drag and drop (pointer + keyboard)                       | 15        |
| F — Optimistic updates, React 19 forms, race conditions      | 15        |
| G — Undo / redo                                              | 5         |
| H — Accessibility and UX                                     | 5         |
| I — Tests (Vitest + Playwright)                              | 10        |
| Q — Code quality rules Q1–Q4                                 | 5         |
| **Bonus (X1–X6)**                                            | up to +15 |

**Passing grade:** 70 points. CI (format, lint, tests, build) must be green, or the PR is not reviewed.

**Walk-through:** after the review there is a short live session (about 20 minutes). You explain parts of your code and maybe change something small. If you cannot explain your own code, the score goes down.

---

## 6. How to submit

Same as Project 01 — see the [repository README](../README.md#how-to-submit-your-work).

1. Update your fork from `main`.
2. Create a branch `project02/<your-github-username>`.
3. Open a **draft PR early** (after Part A) to get feedback on your architecture.
4. When you finish, mark the PR "Ready for review" and fill in the PR template.
5. In the PR description, add a short **Architecture** section: folder structure, the shape of your state, and how a card move flows from the pointer event to the API and back.

Good luck — and have fun building it! 🚀
