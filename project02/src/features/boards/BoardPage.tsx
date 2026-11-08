import { useEffect, useState } from 'react'
import { Link, Outlet, useParams } from 'react-router'
import { ArrowLeft, Plus } from 'lucide-react'
import { api, ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { BoardDetail } from '@/types/api'
import { Column } from './Column'

export interface BoardOutlet {
  detail: BoardDetail
}

export function BoardPage() {
  const { boardId } = useParams()
  const [detail, setDetail] = useState<BoardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!boardId) return
    const controller = new AbortController()
    api
      .getBoard(boardId, controller.signal)
      .then((data) => {
        setDetail(data)
        setLoading(false)
        setError(null)
      })
      .catch((reason) => {
        if (controller.signal.aborted) return
        setLoading(false)
        setError(reason instanceof Error ? reason : new Error('Could not load the board.'))
      })
    return () => controller.abort()
  }, [boardId, version])

  if (loading)
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
  if (error)
    return (
      <div role="alert" className="py-20 text-center">
        <h1 className="text-2xl font-semibold">
          {error instanceof ApiError && error.status === 404
            ? 'Board not found'
            : 'Could not load board'}
        </h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button
          onClick={() => {
            setLoading(true)
            setVersion((value) => value + 1)
          }}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  if (!detail) return null

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
            <h1 className="text-3xl font-semibold tracking-tight">{detail.board.title}</h1>
          </div>
          <Button variant="outline" disabled>
            <Plus /> Add column
          </Button>
        </div>
      </div>
      {detail.columns.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          This board has no columns yet.
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6">
          {detail.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={detail.cards.filter((card) => card.columnId === column.id)}
              boardId={detail.board.id}
            >
              <Column.Header />
              <Column.Cards />
            </Column>
          ))}
        </div>
      )}
      <Outlet context={{ detail } satisfies BoardOutlet} />
    </div>
  )
}
