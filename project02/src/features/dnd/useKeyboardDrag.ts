import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BoardState } from '@/features/boards/boardReducer'
import type { Location } from '@/features/history/historyReducer'

interface Active {
  id: string
  target: Location
}

export function useKeyboardDrag(
  state: BoardState,
  moveCard: (id: string, to: Location) => void,
  moveColumn: (id: string, position: number) => Promise<void>,
) {
  const [active, setActive] = useState<Active | null>(null)
  const [activeColumn, setActiveColumn] = useState<{ id: string; position: number } | null>(null)
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
        setActiveColumn(null)
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

  function onColumnKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    const column = state.columns[id]
    if (!column) return
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      if (activeColumn?.id === id) {
        void moveColumn(id, activeColumn.position)
        setAnnouncement(`Dropped column ${column.title} at position ${activeColumn.position + 1}.`)
        setActiveColumn(null)
      } else {
        setActive(null)
        setActiveColumn({ id, position: state.columnOrder.indexOf(id) })
        setAnnouncement(
          `Picked up column ${column.title}. Use left and right arrows to move, Space to drop, Escape to cancel.`,
        )
      }
      return
    }
    if (activeColumn?.id !== id) return
    if (event.key === 'Escape') {
      event.preventDefault()
      setActiveColumn(null)
      setAnnouncement(`Cancelled moving column ${column.title}.`)
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const position = Math.max(
      0,
      Math.min(
        state.columnOrder.length - 1,
        activeColumn.position + (event.key === 'ArrowLeft' ? -1 : 1),
      ),
    )
    setActiveColumn({ id, position })
    setAnnouncement(
      `Moved column ${column.title} to position ${position + 1} of ${state.columnOrder.length}.`,
    )
  }

  return { active, activeColumn, announcement, onCardKeyDown, onColumnKeyDown }
}
