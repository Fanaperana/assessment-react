import { useState } from 'react'
import { ArrowRight, Layers3, MoreHorizontal, Rows3 } from 'lucide-react'
import { Link } from 'react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BoardSummary } from '@/types/api'
import { useBoards } from './useBoards'

export function BoardTile({ board }: { board: BoardSummary }) {
  const { renameBoard, deleteBoard } = useBoards()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [busy, setBusy] = useState(false)

  async function rename() {
    const next = title.trim()
    if (!next || next === board.title) {
      setRenameOpen(false)
      return
    }
    setBusy(true)
    const saved = await renameBoard(board, next)
    if (saved) setRenameOpen(false)
    setBusy(false)
  }

  function remove() {
    void deleteBoard(board)
  }

  return (
    <Card className="transition-shadow hover:shadow-md motion-reduce:transition-none">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Layers3 className="size-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${board.title}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setTitle(board.title)
                  setRenameOpen(true)
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDeleteOpen(true)} variant="destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename board</DialogTitle>
            <DialogDescription>Choose a clear name for this board.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void rename()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor={`rename-${board.id}`}>Board title</Label>
              <Input
                id={`rename-${board.id}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                Save name
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {board.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This also deletes {board.columnCount} columns and {board.cardCount} cards. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete board</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
