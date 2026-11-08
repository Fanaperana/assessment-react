import { ArrowRight, Layers3, Plus, Rows3 } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useBoards } from './useBoards'

export function BoardListPage() {
  const { boards, loading, error, reload } = useBoards()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">YOUR WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your boards</h1>
          <p className="mt-2 text-muted-foreground">
            Keep ideas moving from first thought to finished work.
          </p>
        </div>
        <Button disabled>
          <Plus /> New board
        </Button>
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p>{error}</p>
          <Button variant="outline" onClick={reload} className="mt-3">
            Retry
          </Button>
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : boards.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed p-14 text-center text-muted-foreground">
          No boards yet. Create your first board to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="transition-shadow hover:shadow-md motion-reduce:transition-none"
            >
              <CardHeader>
                <div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Layers3 className="size-5" />
                </div>
                <CardTitle>{board.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Rows3 className="size-4" /> {board.columnCount} columns
                  </span>
                  <span>{board.cardCount} cards</span>
                </span>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/boards/${board.id}`} aria-label={`Open ${board.title}`}>
                    <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
