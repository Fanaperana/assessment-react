<?php

namespace App\Services;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\AgentReplyNotification;
use App\Notifications\TicketAssignedNotification;
use App\Notifications\TicketCreatedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

class TicketService
{
    public function __construct(private readonly TicketActivityService $activity) {}

    public function create(User $user, array $data, array $files = []): Ticket
    {
        $ticket = Ticket::create([...$data, 'created_by_id' => $user->id, 'sla_due_at' => $this->slaDue($data['priority'] ?? TicketPriority::Normal->value)]);
        $this->activity->record($ticket, $user, 'created', 'Ticket was created.');
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
        if (!$internal && $ticket->creator) $ticket->creator->notify(new AgentReplyNotification($ticket));
    }

    public function assign(User $user, Ticket $ticket, ?int $assigneeId): void
    {
        $assignee = $assigneeId ? User::findOrFail($assigneeId) : null;
        $ticket->update(['assignee_id' => $assignee?->id]);
        $this->activity->record($ticket, $user, 'assigned', 'Ticket assignment changed.');
        if ($assignee) $assignee->notify(new TicketAssignedNotification($ticket));
    }

    public function update(User $user, Ticket $ticket, array $data): void
    {
        $before = $ticket->status->value;
        $ticket->update($data + ['closed_at' => (($data['status'] ?? null) === TicketStatus::Closed->value) ? now() : $ticket->closed_at]);
        $this->activity->record($ticket, $user, 'updated', "Ticket changed from {$before}.");
    }

    private function storeAttachments($attachable, User $user, array $files): void
    {
        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) continue;
            $path = $file->store('attachments', 'private');
            $attachable->attachments()->create(['uploaded_by_id' => $user->id, 'disk' => 'private', 'path' => $path, 'original_name' => $file->getClientOriginalName(), 'mime_type' => $file->getMimeType() ?: 'application/octet-stream', 'size' => $file->getSize() ?: 0]);
        }
    }

    private function slaDue(string $priority): \Carbon\CarbonInterface
    {
        return now()->addHours(match ($priority) {
            TicketPriority::Urgent->value => 4,
            TicketPriority::High->value => 24,
            TicketPriority::Normal->value => 72,
            default => 120,
        });
    }
}
