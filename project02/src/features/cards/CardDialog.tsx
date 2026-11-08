import { useNavigate, useOutletContext, useParams } from 'react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BoardOutlet } from '@/features/boards/BoardPage'

export function CardDialog() {
  const { boardId, cardId } = useParams()
  const { state } = useOutletContext<BoardOutlet>()
  const card = cardId ? state.cards[cardId] : undefined
  const navigate = useNavigate()
  return (
    <Dialog open onOpenChange={() => navigate(`/boards/${boardId}`)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card?.title ?? 'Card not found'}</DialogTitle>
          <DialogDescription>{card?.description || 'No description yet.'}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
