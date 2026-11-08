# FlowBoard mock API

The app has a fake REST API that runs **inside the browser** with [MSW (Mock Service Worker)](https://mswjs.io/).
You call it with normal `fetch('/api/...')`. It is already started in `src/main.tsx` and in the tests (`src/test/setup.ts`).

- Code: `src/mocks/` — **do not change it** for your solution.
- Types: `src/types/api.ts` — import them, do not change them.
- Data is saved in `localStorage` (key `flowboard:db`), so it survives a reload.

## Behaviour you must handle

| Behaviour                                                     | Default    | Change it (DevTools console, then reload)           |
| ------------------------------------------------------------- | ---------- | --------------------------------------------------- |
| Every response waits                                          | 300–800 ms | `localStorage.setItem('flowboard:delay', '2000')`   |
| Write requests (POST, PATCH, DELETE) fail randomly with `500` | 10%        | `localStorage.setItem('flowboard:failRate', '0.5')` |
| Reset all data to the seed                                    | —          | `localStorage.removeItem('flowboard:db')`           |

In tests there is **no delay and no random failure**. To test an error, override a handler:

```ts
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'

server.use(
  http.patch('/api/cards/:cardId', () =>
    HttpResponse.json({ message: 'Server error' }, { status: 500 }),
  ),
)
```

## Errors

Every error response has status `400`, `404` or `500` and this body:

```json
{ "message": "Title is required." }
```

## Endpoints

### Boards

| Method | URL                    | Body                  | Success                                           |
| ------ | ---------------------- | --------------------- | ------------------------------------------------- |
| GET    | `/api/boards`          | —                     | `200` `BoardSummary[]`                            |
| POST   | `/api/boards`          | `{ "title": string }` | `201` `Board`                                     |
| GET    | `/api/boards/:boardId` | —                     | `200` `BoardDetail` (`{ board, columns, cards }`) |
| PATCH  | `/api/boards/:boardId` | `{ "title": string }` | `200` `Board`                                     |
| DELETE | `/api/boards/:boardId` | —                     | `204` (also deletes its columns and cards)        |

### Columns

| Method | URL                            | Body                                        | Success                           |
| ------ | ------------------------------ | ------------------------------------------- | --------------------------------- |
| POST   | `/api/boards/:boardId/columns` | `{ "title": string }`                       | `201` `Column` (added at the end) |
| PATCH  | `/api/columns/:columnId`       | `{ "title"?: string, "position"?: number }` | `200` `Column`                    |
| DELETE | `/api/columns/:columnId`       | —                                           | `204` (also deletes its cards)    |

### Cards

| Method | URL                            | Body                                 | Success                         |
| ------ | ------------------------------ | ------------------------------------ | ------------------------------- |
| POST   | `/api/columns/:columnId/cards` | `CreateCardInput` (`title` required) | `201` `Card` (added at the end) |
| PATCH  | `/api/cards/:cardId`           | `UpdateCardInput` (any fields)       | `200` `Card`                    |
| DELETE | `/api/cards/:cardId`           | —                                    | `204`                           |

## Positions and moving cards

- `position` is the **0-based index** of a column in its board, or of a card in its column.
- The server keeps positions without gaps (0, 1, 2, …). It renumbers the other items for you.
- To **move a card**, send `PATCH /api/cards/:cardId` with the new `columnId` and/or the new `position`.
  The position is the index in the target column **after** the card is removed from its old place.
  Example — move a card to the top of the "Done" column:

  ```json
  { "columnId": "col-done", "position": 0 }
  ```

- If `position` is bigger than the column length, the card goes to the end.
- A card cannot move to a column of another board (`400`).

## Validation rules

| Field      | Rule                                                  |
| ---------- | ----------------------------------------------------- |
| `title`    | required, not only spaces, max 120 characters (cards) |
| `priority` | `"low"`, `"medium"` or `"high"` (default `"medium"`)  |
| `labels`   | array of strings (default `[]`)                       |
| `dueDate`  | `"YYYY-MM-DD"` or `null` (default `null`)             |
| `position` | integer, 0 or more                                    |
