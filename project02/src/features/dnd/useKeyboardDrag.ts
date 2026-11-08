import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BoardState } from '@/features/boards/boardReducer'
import type { Location } from '@/features/history/historyReducer'

interface Active {
  id: string
  target: Location
}

export function useKeyboardDrag(state: BoardState, moveCard: (id: string, to: Location) => void) {
  const [active, setActive] = useState<Active | null>(null)
  const [announcement, setAnnouncement] = useState('')

  function onCardKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    const card = state.cards[id]
    if (!card) return
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      if (active?.id === id) {
        moveCard(id, active.target)
        setAnnouncement(`Dropped ${card.title}.`)
        setActive(null)
      } else {
        setActive({ id, target: { columnId: card.columnId, position: card.position } })
        setAnnouncement(
          `Picked up ${card.title}. Use arrow keys to move, Space to drop, Escape to cancel.`,
        )
      }
      return
    }
    if (!active || active.id !== id) return
    if (event.key === 'Escape') {
      event.preventDefault()
      setActive(null)
      setAnnouncement(`Cancelled moving ${card.title}.`)
      return
    }
    const { columnId, position } = active.target
    const columnIndex = state.columnOrder.indexOf(columnId)
    const nextColumnIndex =
      event.key === 'ArrowLeft'
        ? columnIndex - 1
        : event.key === 'ArrowRight'
          ? columnIndex + 1
          : columnIndex
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    if (nextColumnIndex < 0 || nextColumnIndex >= state.columnOrder.length) return
    const nextColumn = state.columnOrder[nextColumnIndex]
    const count = (state.cardIdsByColumn[nextColumn] ?? []).filter((cardId) => cardId !== id).length
    const nextPosition =
      event.key === 'ArrowUp' ? position - 1 : event.key === 'ArrowDown' ? position + 1 : position
    const target = { columnId: nextColumn, position: Math.max(0, Math.min(nextPosition, count)) }
    setActive({ id, target })
    setAnnouncement(
      `Moved ${card.title} to ${state.columns[nextColumn].title}, position ${target.position + 1} of ${count + 1}.`,
    )
  }

  return { active, announcement, onCardKeyDown }
}
