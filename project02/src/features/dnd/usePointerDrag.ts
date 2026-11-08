import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { BoardState } from '@/features/boards/boardReducer'
import type { Location } from '@/features/history/historyReducer'

interface Drag {
  kind: 'card' | 'column'
  id: string
  x: number
  y: number
  target: Location | number
}
interface Start {
  kind: Drag['kind']
  id: string
  x: number
  y: number
  pointerId: number
}

export function usePointerDrag(
  state: BoardState,
  moveCard: (id: string, to: Location) => void,
  moveColumn: (id: string, position: number) => Promise<void>,
) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const startRef = useRef<Start | null>(null)
  const suppressClick = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef({ state, moveCard, moveColumn })
  useLayoutEffect(() => {
    latest.current = { state, moveCard, moveColumn }
  }, [state, moveCard, moveColumn])

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const start = startRef.current
      if (!start || event.pointerId !== start.pointerId) return
      if (!dragRef.current && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5)
        return
      const current = latest.current.state
      const element = document.elementFromPoint(event.clientX, event.clientY)
      const columnElement = element?.closest<HTMLElement>('[data-column-id]')
      if (!columnElement) return
      const columnId = columnElement.dataset.columnId ?? ''
      let target: Location | number
      if (start.kind === 'column') {
        const index = current.columnOrder.indexOf(columnId)
        const after =
          event.clientX > columnElement.getBoundingClientRect().left + columnElement.offsetWidth / 2
        const insertion = index + (after ? 1 : 0)
        const sourceIndex = current.columnOrder.indexOf(start.id)
        target = Math.max(0, Math.min(current.columnOrder.length - 1, insertion - (sourceIndex < insertion ? 1 : 0)))
      } else {
        const cardElement = element?.closest<HTMLElement>('[data-card-id]')
        const targetCard = cardElement?.dataset.cardId
          ? current.cards[cardElement.dataset.cardId]
          : undefined
        const ids = (current.cardIdsByColumn[columnId] ?? []).filter((id) => id !== start.id)
        let position = ids.length
        if (targetCard && targetCard.id !== start.id) {
          const after =
            event.clientY > cardElement!.getBoundingClientRect().top + cardElement!.offsetHeight / 2
          position = ids.indexOf(targetCard.id) + (after ? 1 : 0)
        }
        target = { columnId, position: Math.max(0, position) }
      }
      const next = { kind: start.kind, id: start.id, x: event.clientX, y: event.clientY, target }
      dragRef.current = next
      setDrag(next)
      event.preventDefault()
    }
    function onEnd(event: PointerEvent) {
      const start = startRef.current
      if (!start || event.pointerId !== start.pointerId) return
      const current = dragRef.current
      if (current && event.type !== 'pointercancel') {
        if (current.kind === 'card') latest.current.moveCard(current.id, current.target as Location)
        else void latest.current.moveColumn(current.id, current.target as number)
        suppressClick.current = true
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          suppressClick.current = false
        }, 500)
      }
      dragRef.current = null
      startRef.current = null
      setDrag(null)
    }
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    const columnHandle = target.closest<HTMLElement>('[data-column-drag-handle]')
    const cardHandle = target.closest<HTMLElement>('[data-card-drag-handle]')
    const cardElement = target.closest<HTMLElement>('[data-card-id]')
    if (!columnHandle && !cardHandle && (!cardElement || event.pointerType !== 'mouse')) return
    if (target.closest('input, textarea, select, button') && !columnHandle && !cardHandle) return
    const kind = columnHandle ? 'column' : 'card'
    const id =
      kind === 'column'
        ? columnHandle?.closest<HTMLElement>('[data-column-id]')?.dataset.columnId
        : (cardElement?.dataset.cardId ??
          cardHandle?.closest<HTMLElement>('[data-card-id]')?.dataset.cardId)
    if (!id) return
    startRef.current = { kind, id, x: event.clientX, y: event.clientY, pointerId: event.pointerId }
  }

  function onClickCapture(event: React.MouseEvent<HTMLElement>) {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick.current = false
  }
  return { drag, onPointerDown, onClickCapture }
}
