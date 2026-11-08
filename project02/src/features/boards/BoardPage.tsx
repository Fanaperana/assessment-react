import { useDeferredValue, useEffect, useReducer, useState } from 'react'
import { Link, Outlet, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Plus } from 'lucide-react'
import { api, ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Priority } from '@/types/api'
import { BoardFilters } from './BoardFilters'
import { boardReducer, emptyBoard, selectVisibleCards } from './boardReducer'
import type { BoardState } from './boardReducer'
import { Column } from './Column'

export interface BoardOutlet {
  state: BoardState
}

export function BoardPage() {
  const { boardId } = useParams()
  const [params, setParams] = useSearchParams()
  const [state, dispatch] = useReducer(boardReducer, emptyBoard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ id: string; cause: Error } | null>(null)
  const [version, setVersion] = useState(0)
  const q = params.get('q') ?? ''
  const deferredQ = useDeferredValue(q)
  const selectedPriority = params.get('priority') ?? ''
  const priority: Priority | '' =
    selectedPriority === 'high' || selectedPriority === 'medium' || selectedPriority === 'low'
      ? selectedPriority
      : ''
  const label = params.get('label') ?? ''
  const labels = [...new Set(Object.values(state.cards).flatMap((card) => card.labels))].sort()

  useEffect(() => {
    if (!boardId) return
    const controller = new AbortController()
    api
      .getBoard(boardId, controller.signal)
      .then((detail) => {
        dispatch({ type: 'LOAD', detail })
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
  }, [boardId, version])

  function changeFilter(key: 'q' | 'priority' | 'label', value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: key === 'q' },
    )
  }

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
    <div className="space-y-6">
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
            <h1 className="text-3xl font-semibold tracking-tight">{state.board.title}</h1>
          </div>
          <Button variant="outline" disabled>
            <Plus /> Add column
          </Button>
        </div>
      </div>
      <BoardFilters
        q={q}
        priority={priority}
        label={label}
        labels={labels}
        onChange={changeFilter}
      />
      {state.columnOrder.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          This board has no columns yet.
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6">
          {state.columnOrder.map((id) => (
            <Column
              key={id}
              column={state.columns[id]}
              cards={selectVisibleCards(state, id, { q: deferredQ, priority, label })}
              boardId={state.board!.id}
              query={deferredQ}
            >
              <Column.Header />
              <Column.Cards />
            </Column>
          ))}
        </div>
      )}
      <Outlet context={{ state } satisfies BoardOutlet} />
    </div>
  )
}
