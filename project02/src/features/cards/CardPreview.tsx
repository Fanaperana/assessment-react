import { AlignLeft, CalendarDays } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card as Surface, CardContent } from '@/components/ui/card'
import type { Card } from '@/types/api'

const today = new Date().toISOString().slice(0, 10)

export function CardPreview({ card, boardId }: { card: Card; boardId: string; columnId: string }) {
  const overdue = card.dueDate !== null && card.dueDate < today
  const priorityClass =
    card.priority === 'high'
      ? 'border-red-300 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
      : card.priority === 'low'
        ? 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200'
        : 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'

  return (
    <Surface
      size="sm"
      className="bg-card shadow-xs transition-shadow hover:shadow-md motion-reduce:transition-none"
    >
      <CardContent className="space-y-3">
        <Link
          to={`/boards/${boardId}/cards/${card.id}`}
          className="block rounded-sm leading-snug font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {card.title}
        </Link>
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
              <span aria-label="Has description">
                <AlignLeft className="size-3" />
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Surface>
  )
}
