import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DialogFooter } from '@/components/ui/dialog'
import type { Card, Priority } from '@/types/api'
export function CardEditor({
  card,
  save,
  remove,
}: {
  card: Card
  save: (id: string, input: Partial<Card>) => Promise<void>
  remove: (id: string) => Promise<void>
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [priority, setPriority] = useState<Priority>(card.priority)
  const [labels, setLabels] = useState(card.labels)
  const [newLabel, setNewLabel] = useState('')
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  function addLabel() {
    const value = newLabel.trim()
    if (value && !labels.includes(value)) setLabels((items) => [...items, value])
    setNewLabel('')
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    void save(card.id, {
      title: title.trim(),
      description,
      priority,
      labels,
      dueDate: dueDate || null,
    })
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-title">Title</Label>
        <Input
          id="card-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="card-description">Description</Label>
        <Textarea
          id="card-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="card-priority">Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
          <SelectTrigger id="card-priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="card-due-date">Due date</Label>
        <Input
          id="card-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Labels</legend>
        <div className="flex flex-wrap gap-1">
          {labels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
              <button
                type="button"
                className="ml-1 rounded focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`Remove ${label}`}
                onClick={() => setLabels((items) => items.filter((item) => item !== label))}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            aria-label="New label"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addLabel()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addLabel}>
            Add label
          </Button>
        </div>
      </fieldset>
      <DialogFooter className="justify-between sm:justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              Delete card
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {card.title}?</AlertDialogTitle>
              <AlertDialogDescription>You can undo this action afterward.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void remove(card.id)}>
                Delete card
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  )
}
