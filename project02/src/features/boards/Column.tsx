import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { Card, Column as ColumnType } from '@/types/api'
import { CardPreview } from '@/features/cards/CardPreview'
import { QuickAddCard } from '@/features/cards/QuickAddCard'
import { useDnd } from '@/features/dnd/DndContext'

interface Value {
  column: ColumnType
  cards: Card[]
  boardId: string
  query: string
  onRename: (id: string, title: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddCard: (columnId: string, title: string) => Promise<Card>
}

const ColumnContext = createContext<Value | null>(null)

function useColumn() {
  const value = useContext(ColumnContext)
  if (!value) throw new Error('Column component must be inside Column')
  return value
}

export function Column({ children, ...value }: Value & { children: ReactNode }) {
  return (
    <ColumnContext.Provider value={value}>
      <section
        data-column-id={value.column.id}
        className="w-80 shrink-0 snap-start self-start rounded-xl border bg-muted/45 p-3"
      >
        <div className="space-y-3">{children}</div>
      </section>
    </ColumnContext.Provider>
  )
}

function Header() {
  const { column, cards, onRename, onDelete } = useColumn()
  const dnd = useDnd()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  function save() {
    if (title.trim() && title.trim() !== column.title) void onRename(column.id, title.trim())
    else setTitle(column.title)
    setEditing(false)
  }
  return (
    <header className="flex items-center justify-between gap-2">
      <Button
        size="icon-sm"
        variant="ghost"
        data-column-drag-handle
        aria-label={`Drag ${column.title}`}
        aria-grabbed={dnd?.activeColumnId === column.id}
        onKeyDown={(event) => dnd?.onColumnKeyDown(event, column.id)}
        className="cursor-grab touch-none"
      >
        <GripVertical />
      </Button>
      {editing ? (
        <Input
          autoFocus
          aria-label="Column title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save()
            if (event.key === 'Escape') {
              setTitle(column.title)
              setEditing(false)
            }
          }}
          onBlur={save}
        />
      ) : (
        <button
          type="button"
          className="flex-1 rounded text-left font-semibold focus-visible:outline-2 focus-visible:outline-ring"
          onClick={() => setEditing(true)}
        >
          {column.title}{' '}
          <span className="text-sm font-normal text-muted-foreground">{cards.length}</span>
        </button>
      )}
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={`Rename ${column.title}`}
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label={`Delete ${column.title}`}>
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {column.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {cards.length} {cards.length === 1 ? 'card' : 'cards'} in this
              column.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete(column.id)}>
              Delete column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}

function Cards() {
  const { cards, boardId, query, column } = useColumn()
  const dnd = useDnd()
  const target = dnd?.target?.columnId === column.id ? dnd.target.position : -1
  const insertion = target < 0 ? -1 : cards.findIndex((card) => card.position >= target)
  const placeholder = (
    <div
      key="drop-placeholder"
      data-drop-placeholder
      className="h-16 rounded-lg border-2 border-dashed border-primary bg-primary/10"
      aria-hidden="true"
    />
  )
  return (
    <div className="space-y-2" data-card-list>
      {cards.length === 0 && target < 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No cards yet.</p>
      )}
      {cards.map((card, index) => (
        <div key={card.id}>
          {insertion === index && placeholder}
          <CardPreview card={card} boardId={boardId} query={query} />
        </div>
      ))}
      {target >= 0 && insertion < 0 && placeholder}
    </div>
  )
}

function AddCard() {
  const { column, onAddCard } = useColumn()
  return <QuickAddCard onAdd={(title) => onAddCard(column.id, title)} />
}

Column.Header = Header
Column.Cards = Cards
Column.AddCard = AddCard
