# Assessment — React

Hands-on React projects. Each project lives in its own folder and has an `ASSIGNMENT.md` with the requirements and grading.

| # | Project | Topics | Folder |
| --- | --- | --- | --- |
| 01 | **ShopLite** — online shop front-end | components, hooks, custom hooks, Context + `useReducer`, React Router, data fetching, forms, accessibility, performance, testing | [`project01/`](project01/) |

## How to submit your work

1. **Fork** this repository (button "Fork" at the top right of GitHub).
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/assessment-react.git
   cd assessment-react
   ```
3. **Create a branch** for the project:
   ```bash
   git checkout -b project01/<your-username>
   ```
4. **Install and run** the project:
   ```bash
   cd project01
   npm install
   npm run dev
   ```
5. **Work in small steps.** Commit often with clear messages that name the requirement ID, for example:
   `feat(cart): add UPDATE_QUANTITY action (E1)`.
6. **Before you push**, make sure these pass:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
7. **Push** your branch and open a **Pull Request** to `main` of this repository.
   Fill in the PR template checklist.
8. **Review:** answer the comments and push fixes to the same branch. The PR updates by itself.

You may open a **draft PR** early to ask questions or get feedback before you finish.

## Rules

- Only change files inside the project folder you work on.
- Do not copy a full solution from the internet or from an AI. You may read docs, articles and examples, but you must be able to explain every line you submit.
- Ask questions in the PR comments. A good question is part of the job.

## Useful links

- [react.dev](https://react.dev/learn) — official React docs
- [React Router docs](https://reactrouter.com/)
- [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [DummyJSON docs](https://dummyjson.com/docs)
