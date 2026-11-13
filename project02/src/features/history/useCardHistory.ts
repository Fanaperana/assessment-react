import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api/client'
import { useAbortable } from '@/hooks/useAbortable'
import type { HistoryAction, HistoryState, Location } from './historyReducer'

interface Store {
  send: (action: HistoryAction) => void
  getState: () => HistoryState
}

export function useCardHistory({ send, getState }: Store) {
  const run = useAbortable()
  const queues = useRef(new Map<string, Promise<void>>())
  const confirmed = useRef(new Map<string, Location>())
  const [announcement, setAnnouncement] = useState('')

  function enqueue(id: string, task: () => Promise<void>) {
    const previous = queues.current.get(id) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(task)
    queues.current.set(id, next)
    const clear = () => {
      if (queues.current.get(id) === next) queues.current.delete(id)
    }
    void next.then(clear, clear)
    return next
  }

  function moveCard(id: string, to: Location) {
    const card = getState().present.cards[id]
    if (!card || (card.columnId === to.columnId && card.position === to.position)) return
    const from = { columnId: card.columnId, position: card.position }
    if (!confirmed.current.has(id)) confirmed.current.set(id, from)
    const operation = { kind: 'move' as const, id: crypto.randomUUID(), cardId: id, from, to }
    send({ type: 'RECORD', operation })
    void enqueue(id, async () => {
      try {
        await run((signal) => api.updateCard(id, to, signal))
        confirmed.current.set(id, to)
      } catch (reason) {
        if (reason instanceof Error && reason.name === 'AbortError') return
        const current = getState().present.cards[id]
        const latest = current?.columnId === to.columnId && current.position === to.position
        const fallback = confirmed.current.get(id) ?? from
        send({
          type: 'DISCARD',
          id: operation.id,
          rollback: latest ? { type: 'MOVE_CARD', id, ...fallback } : undefined,
        })
        setAnnouncement(
          latest
            ? `Move failed. ${card.title} returned to ${getState().present.columns[fallback.columnId]?.title ?? 'its previous column'}.`
            : `The earlier move of ${card.title} failed. Its latest position was kept.`,
        )
        toast.error('Could not move card', {
          description: reason instanceof Error ? reason.message : undefined,
          action: { label: 'Retry', onClick: () => moveCard(id, to) },
        })
      }
    })
  }

  async function undo() {
    const operation = getState().past.at(-1)
    if (!operation) return
    send({ type: 'UNDO' })
    try {
      if (operation.kind === 'move') {
        await enqueue(operation.cardId, () =>
          run((signal) => api.updateCard(operation.cardId, operation.from, signal)).then(
            () => undefined,
          ),
        )
        confirmed.current.set(operation.cardId, operation.from)
      } else {
        const { title, description, priority, labels, dueDate, columnId, position } = operation.card
        const card = await run((signal) =>
          api.createCard(columnId, { title, description, priority, labels, dueDate }, signal),
        )
        await run((signal) => api.updateCard(card.id, { position }, signal))
        send({ type: 'REMAP_CARD', oldId: operation.card.id, card })
      }
    } catch (reason) {
      send({ type: 'REDO' })
      toast.error('Could not undo', {
        description: reason instanceof Error ? reason.message : undefined,
        action: { label: 'Retry', onClick: () => void undo() },
      })
    }
  }

  async function redo() {
    const operation = getState().future[0]
    if (!operation) return
    send({ type: 'REDO' })
    try {
      if (operation.kind === 'move') {
        await enqueue(operation.cardId, () =>
          run((signal) => api.updateCard(operation.cardId, operation.to, signal)).then(
            () => undefined,
          ),
        )
        confirmed.current.set(operation.cardId, operation.to)
      } else await run((signal) => api.deleteCard(operation.card.id, signal))
    } catch (reason) {
      send({ type: 'UNDO' })
      toast.error('Could not redo', {
        description: reason instanceof Error ? reason.message : undefined,
        action: { label: 'Retry', onClick: () => void redo() },
      })
    }
  }

  const latest = useRef({ undo, redo })
  useLayoutEffect(() => {
    latest.current = { undo, redo }
  })
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, [contenteditable="true"]')
      )
        return
      event.preventDefault()
      if (event.shiftKey) void latest.current.redo()
      else void latest.current.undo()
    }
    function onToastUndo() {
      void latest.current.undo()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('flowboard:undo', onToastUndo)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('flowboard:undo', onToastUndo)
    }
  }, [])
  return { moveCard, undo, redo, announcement }
}
