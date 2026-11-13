<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\User;

class TicketActivityService
{
    public function record(Ticket $ticket, ?User $user, string $type, string $description, array $metadata = []): TicketActivity
    {
        return $ticket->activities()->create(['user_id' => $user?->id, 'type' => $type, 'description' => $description, 'metadata' => $metadata]);
    }
}
