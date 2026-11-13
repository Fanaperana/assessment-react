<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $base = Ticket::query()->whereIn('status', [TicketStatus::Open, TicketStatus::Pending]);
        return Inertia::render('dashboard', [
            'stats' => [
                'open' => (clone $base)->visibleTo($user)->count(),
                'assigned' => $user->isAgent() ? (clone $base)->assignedTo($user)->count() : 0,
                'unassigned' => $user->isAgent() ? (clone $base)->whereNull('assignee_id')->count() : 0,
                'slaRisk' => $user->isAgent() ? (clone $base)->where('sla_due_at', '<', now()->addHours(4))->count() : 0,
            ],
            'recent' => Ticket::with(['category:id,name', 'assignee:id,name'])->visibleTo($user)->latest()->limit(6)->get(),
        ]);
    }
}
