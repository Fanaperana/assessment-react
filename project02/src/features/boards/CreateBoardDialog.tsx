import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBoards } from './useBoards'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating…' : 'Create board'}
    </Button>
  )
}

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false)
  const { reload } = useBoards()
  const navigate = useNavigate()
  const [error, action] = useActionState(async (_previous: string | null, formData: FormData) => {
    const title = String(formData.get('title') ?? '').trim()
    if (!title) return 'Enter a board title.'
    try {
      const board = await api.createBoard(title)
      reload()
      setOpen(false)
      navigate(`/boards/${board.id}`)
      return null
    } catch (reason) {
      return reason instanceof Error ? reason.message : 'Could not create board.'
    }
  }, null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
          <DialogDescription>Give your project a place to grow.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-title">Board title</Label>
            <Input id="board-title" name="title" maxLength={120} required autoFocus />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
