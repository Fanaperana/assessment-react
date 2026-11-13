import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Card } from '@/types/api'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding…' : 'Add card'}
    </Button>
  )
}

export function QuickAddCard({ onAdd }: { onAdd: (title: string) => Promise<Card> }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, action] = useActionState(async (_: string | null, data: FormData) => {
    const title = String(data.get('title') ?? '').trim()
    if (!title) return 'Enter a card title.'
    try {
      await onAdd(title)
      setValue('')
      return null
    } catch (reason) {
      return reason instanceof Error ? reason.message : 'Could not add card.'
    }
  }, null)
  if (!open)
    return (
      <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(true)}>
        <Plus /> Add a card
      </Button>
    )
  return (
    <form
      action={action}
      className="space-y-2"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          setOpen(false)
        }
      }}
    >
      <Input
        autoFocus
        name="title"
        aria-label="Card title"
        placeholder="Card title"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Submit />
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
