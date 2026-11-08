import { createContext, useContext } from 'react'
import type { KeyboardEvent } from 'react'
import type { Location } from '@/features/history/historyReducer'

export interface DndValue {
  activeId: string | null
  target: Location | null
  onCardKeyDown: (event: KeyboardEvent<HTMLElement>, id: string) => void
}

export const DndContext = createContext<DndValue | null>(null)
export function useDnd() {
  return useContext(DndContext)
}
