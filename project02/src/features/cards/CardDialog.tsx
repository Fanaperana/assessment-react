import { useNavigate, useOutletContext, useParams } from 'react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CardEditor } from './CardEditor'
import type { BoardOutlet } from '@/features/boards/BoardPage'

export function CardDialog() {
  const { boardId, cardId } = useParams()
  const { state, actions } = useOutletContext<BoardOutlet>()
  const card = cardId ? state.cards[cardId] : undefined
  const navigate = useNavigate()
  function close() {
    navigate(`/boards/${boardId}`)
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{card?.title ?? 'Card not found'}</DialogTitle>
          <DialogDescription>
            {card ? 'Edit card details and save your changes.' : 'This card is unavailable.'}
          </DialogDescription>
        </DialogHeader>
        {card && (
          <CardEditor
            key={card.id}
            card={card}
            save={actions.updateCard}
            remove={async (id) => {
              await actions.deleteCard(id)
              close()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
