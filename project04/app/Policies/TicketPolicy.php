<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Ticket $ticket): bool { return $user->isAgent() || $ticket->created_by_id === $user->id; }
    public function create(User $user): bool { return $user->role !== null; }
    public function update(User $user, Ticket $ticket): bool { return $user->isAgent(); }
    public function assign(User $user, Ticket $ticket): bool { return $user->isAgent(); }
    public function reply(User $user, Ticket $ticket): bool { return $this->view($user, $ticket); }
    public function addInternalNote(User $user, Ticket $ticket): bool { return $user->isAgent(); }
    public function close(User $user, Ticket $ticket): bool { return $user->isAgent() || $ticket->created_by_id === $user->id; }
}
