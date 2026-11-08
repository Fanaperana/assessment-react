import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { CardPreview } from '@/features/cards/CardPreview'
import type { Card, Column as ColumnType } from '@/types/api'

interface ColumnValue {
  column: ColumnType
  cards: Card[]
  boardId: string
  query: string
}
const ColumnContext = createContext<ColumnValue | null>(null)

function useColumn() {
  const value = useContext(ColumnContext)
  if (!value) throw new Error('Column parts must be inside Column.')
  return value
}

export function Column({
  column,
  cards,
  boardId,
  query,
  children,
}: ColumnValue & { children: ReactNode }) {
  return (
    <ColumnContext.Provider value={{ column, cards, boardId, query }}>
      <section
        className="flex h-fit max-h-[calc(100svh-180px)] w-[calc(100vw-2rem)] max-w-[360px] shrink-0 snap-center flex-col rounded-xl border bg-muted/45 shadow-sm sm:w-80"
        aria-label={`${column.title} column`}
      >
        {children}
      </section>
    </ColumnContext.Provider>
  )
}

function ColumnHeader() {
  const { column, cards } = useColumn()
  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <h2 className="min-w-0 truncate font-semibold">{column.title}</h2>
      <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
        {cards.length}
      </span>
    </div>
  )
}

function ColumnCards() {
  const { cards, boardId, query } = useColumn()
  return (
    <div className="space-y-3 overflow-y-auto p-3">
      {cards.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-background/50 p-8 text-center text-sm text-muted-foreground">
          No cards yet
        </div>
      ) : (
        cards.map((card) => (
          <CardPreview key={card.id} card={card} boardId={boardId} query={query} />
        ))
      )}
    </div>
  )
}

Column.Header = ColumnHeader
Column.Cards = ColumnCards
