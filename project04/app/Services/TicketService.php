<?php

namespace App\Services;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\AgentReplyNotification;
use App\Notifications\TicketAssignedNotification;
use App\Notifications\TicketCreatedNotification;
use Carbon\CarbonInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

class TicketService
{
    public function __construct(private readonly TicketActivityService $activity) {}

    public function create(User $user, array $data, array $files = []): Ticket
    {
        $priority = $data['priority'] ?? TicketPriority::Normal->value;
        $ticket = Ticket::create([
            ...$data,
            'created_by_id' => $user->id,
            'status' => $data['status'] ?? TicketStatus::Open->value,
            'priority' => $priority,
            'sla_due_at' => $this->slaDue($priority),
        ]);
        $this->activity->record($ticket, $user, 'created', "{$user->name} created the ticket.");
        $this->storeAttachments($ticket, $user, $files);
        Notification::send(User::whereIn('role', ['agent', 'admin'])->get(), new TicketCreatedNotification($ticket));

        return $ticket;
    }

    public function reply(User $user, Ticket $ticket, string $body, bool $internal, array $files = []): void
    {
        $ticket->loadMissing('creator');
        $reply = $ticket->replies()->create(['user_id' => $user->id, 'body' => $body, 'is_internal' => $internal]);
        $this->activity->record($ticket, $user, $internal ? 'internal_note' : 'reply', $internal ? 'Internal note added.' : 'Public reply added.');
        $this->storeAttachments($reply, $user, $files);
        if (! $internal && $user->isAgent() && $ticket->creator) {
            $ticket->creator->notify(new AgentReplyNotification($ticket));
        }
    }

    public function assign(User $user, Ticket $ticket, ?int $assigneeId): void
    {
        $previousAssignee = User::find($ticket->assignee_id)?->name ?? 'unassigned';
        $assignee = $assigneeId ? User::findOrFail($assigneeId) : null;
        $ticket->update(['assignee_id' => $assignee?->id]);
        $actor = ucfirst($user->role->value).' '.$user->name;
        $this->activity->record($ticket, $user, 'assigned', "{$actor} assigned the ticket from {$previousAssignee} to ".($assignee?->name ?? 'unassigned').'.');
        if ($assignee) {
            $assignee->notify(new TicketAssignedNotification($ticket));
        }
    }

    public function update(User $user, Ticket $ticket, array $data): void
    {
        $changes = [];
        foreach (['status', 'priority', 'category_id'] as $field) {
            if (! array_key_exists($field, $data)) {
                continue;
            }

            $before = $ticket->getAttribute($field);
            $before = $before instanceof \BackedEnum ? $before->value : $before;
            $after = $data[$field] instanceof \BackedEnum ? $data[$field]->value : $data[$field];
            if ((string) $before !== (string) $after) {
                $changes[$field] = [$before, $after];
            }
        }

        $ticket->update($data + ['closed_at' => (($data['status'] ?? null) === TicketStatus::Closed->value) ? now() : $ticket->closed_at]);
        $actor = ucfirst($user->role->value).' '.$user->name;
        foreach ($changes as $field => [$before, $after]) {
            $label = $field === 'category_id' ? 'category' : $field;
            $this->activity->record($ticket, $user, 'updated', "{$actor} changed {$label} from {$before} to {$after}.");
        }
    }

    private function storeAttachments($attachable, User $user, array $files): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $path = $file->store('attachments', 'private');
            $attachable->attachments()->create(['uploaded_by_id' => $user->id, 'disk' => 'private', 'path' => $path, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType() ?: 'application/octet-stream', 'size' => $file->getSize() ?: 0]);
        }
    }

    private function slaDue(string $priority): CarbonInterface
    {
        return now()->addHours(match ($priority) {
            TicketPriority::Urgent->value => 4,
            TicketPriority::High->value => 24,
            TicketPriority::Normal->value => 72,
            default => 120,
        });
    }
}
