import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BoardTile } from './BoardTile'
import { CreateBoardDialog } from './CreateBoardDialog'
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
        <CreateBoardDialog />
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
            <BoardTile key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  )
}
