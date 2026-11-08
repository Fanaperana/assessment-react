import { AlignLeft, CalendarDays, GripVertical } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card as Surface, CardContent } from '@/components/ui/card'
import type { Card } from '@/types/api'
import { useDnd } from '@/features/dnd/DndContext'

const today = new Date().toISOString().slice(0, 10)

export function CardPreview({
  card,
  boardId,
  query,
}: {
  card: Card
  boardId: string
  query: string
}) {
  const overdue = card.dueDate !== null && card.dueDate < today
  const dnd = useDnd()
  const priorityClass =
    card.priority === 'high'
      ? 'border-red-300 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
      : card.priority === 'low'
        ? 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200'
        : 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'

  return (
    <Surface
      data-card-id={card.id}
      size="sm"
      className="bg-card shadow-xs transition-shadow hover:shadow-md motion-reduce:transition-none"
    >
      <CardContent className="space-y-3">
        <div className="flex items-start gap-1">
          <button
            type="button"
            data-card-drag-handle
            aria-label={`Drag ${card.title}`}
            className="cursor-grab touch-none rounded p-1 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <GripVertical className="size-4" />
          </button>
          <Link
            to={`/boards/${boardId}/cards/${card.id}`}
            onKeyDown={(event) => dnd?.onCardKeyDown(event, card.id)}
            aria-grabbed={dnd?.activeId === card.id}
            className="block flex-1 rounded-sm leading-snug font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <HighlightedTitle title={card.title} query={query} />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={priorityClass}>
            {card.priority}
          </Badge>
          {card.labels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
        {(card.dueDate || card.description) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {card.dueDate && (
              <span
                className={`inline-flex items-center gap-1 ${overdue ? 'font-medium text-destructive' : ''}`}
              >
                <CalendarDays className="size-3" /> {card.dueDate}
              </span>
            )}
            {card.description && (
              <span>
                <AlignLeft aria-hidden="true" className="size-3" />
                <span className="sr-only">Has description</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Surface>
  )
}

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const needle = query.trim()
  const index = needle ? title.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase()) : -1
  if (index < 0) return title
  return (
    <>
      {title.slice(0, index)}
      <mark className="rounded-sm bg-yellow-200 text-yellow-950 dark:bg-yellow-700 dark:text-white">
        {title.slice(index, index + needle.length)}
      </mark>
      {title.slice(index + needle.length)}
    </>
  )
}
