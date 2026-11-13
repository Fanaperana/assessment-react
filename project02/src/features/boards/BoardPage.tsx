import { useEffect, useState } from 'react'
import { Link, Outlet, useParams } from 'react-router'
import { createPortal } from 'react-dom'
import { ArrowLeft } from 'lucide-react'
import { api, ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BoardFilters } from './BoardFilters'
import { selectVisibleCards } from './boardReducer'
import type { BoardState } from './boardReducer'
import { Column } from './Column'
import { useBoardStore } from './useBoardStore'
import { useBoardMutations } from './useBoardMutations'
import { AddColumnDialog } from './AddColumnDialog'
import { useCardHistory } from '@/features/history/useCardHistory'
import { useKeyboardDrag } from '@/features/dnd/useKeyboardDrag'
import { usePointerDrag } from '@/features/dnd/usePointerDrag'
import { DndContext } from '@/features/dnd/DndContext'
import { useBoardFilters } from './useBoardFilters'

export interface BoardOutlet {
  state: BoardState
  actions: ReturnType<typeof useBoardMutations>
}

export function BoardPage() {
  const { boardId } = useParams()
  const { history, send, getState } = useBoardStore()
  const state = history.present
  const actions = useBoardMutations({ boardId: boardId ?? '', send, getState })
  const moves = useCardHistory({ send, getState })
  const keyboard = useKeyboardDrag(state, moves.moveCard, actions.moveColumn)
  const pointer = usePointerDrag(state, moves.moveCard, actions.moveColumn)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ id: string; cause: Error } | null>(null)
  const [version, setVersion] = useState(0)
  const { q, deferredQ, priority, label, labels, changeFilter } = useBoardFilters(state)

  useEffect(() => {
    if (!boardId) return
    const controller = new AbortController()
    api
      .getBoard(boardId, controller.signal)
      .then((detail) => {
        send({ type: 'LOAD', detail })
        setLoading(false)
        setError(null)
      })
      .catch((reason) => {
        if (controller.signal.aborted) return
        setLoading(false)
        setError({
          id: boardId,
          cause: reason instanceof Error ? reason : new Error('Could not load the board.'),
        })
      })
    return () => controller.abort()
  }, [boardId, version, send])

  if (error && error.id === boardId)
    return (
      <div role="alert" className="py-20 text-center">
        <h1 className="text-2xl font-semibold">
          {error.cause instanceof ApiError && error.cause.status === 404
            ? 'Board not found'
            : 'Could not load board'}
        </h1>
        <p className="mt-2 text-muted-foreground">{error.cause.message}</p>
        <Button
          onClick={() => {
            setLoading(true)
            setError(null)
            setVersion((value) => value + 1)
          }}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  if (loading || !state.board || state.board.id !== boardId)
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-72" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[440px] w-80 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    )

  return (
    <div
      className="space-y-6"
      onPointerDown={pointer.onPointerDown}
      onClickCapture={pointer.onClickCapture}
    >
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All boards
        </Link>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">BOARD</p>
            <h1 id="board-title" tabIndex={-1} className="text-3xl font-semibold tracking-tight">
              {state.board.title}
            </h1>
          </div>
          <AddColumnDialog onAdd={actions.createColumn} />
        </div>
      </div>
      <BoardFilters
        q={q}
        priority={priority}
        label={label}
        labels={labels}
        onChange={changeFilter}
      />
      <div aria-live="assertive" className="sr-only">
        {keyboard.announcement}
      </div>
      {state.columnOrder.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          This board has no columns yet.
        </div>
      ) : (
        <DndContext.Provider
          value={{
            activeId: keyboard.active?.id ?? pointer.drag?.id ?? null,
            activeColumnId: keyboard.activeColumn?.id ?? null,
            target:
              keyboard.active?.target ??
              (pointer.drag?.kind === 'card'
                ? (pointer.drag.target as { columnId: string; position: number })
                : null),
            onCardKeyDown: keyboard.onCardKeyDown,
            onColumnKeyDown: keyboard.onColumnKeyDown,
          }}
        >
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6">
            {state.columnOrder.map((id) => (
              <Column
                key={id}
                column={state.columns[id]}
                cards={selectVisibleCards(state, id, { q: deferredQ, priority, label })}
                boardId={state.board!.id}
                query={deferredQ}
                onRename={actions.renameColumn}
                onDelete={actions.deleteColumn}
                onAddCard={(columnId, title) => actions.createCard(columnId, { title })}
              >
                <Column.Header />
                <Column.Cards />
                <Column.AddCard />
              </Column>
            ))}
          </div>
        </DndContext.Provider>
      )}
      {pointer.drag &&
        createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-50 w-64 rounded-lg border bg-card p-3 shadow-xl"
            style={{ left: pointer.drag.x + 12, top: pointer.drag.y + 12 }}
          >
            {pointer.drag.kind === 'card'
              ? state.cards[pointer.drag.id]?.title
              : state.columns[pointer.drag.id]?.title}
          </div>,
          document.body,
        )}
      <Outlet context={{ state, actions } satisfies BoardOutlet} />
    </div>
  )
}
