<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/index', ['users' => User::orderBy('name')->paginate(20), 'categories' => Category::orderBy('name')->get()]);
    }

    public function updateUser(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());

        return back()->with('success', 'User role updated.');
    }

    public function storeCategory(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        Category::create(['name' => $data['name'], 'slug' => str($data['name'])->slug()]);

        return back()->with('success', 'Category created.');
    }

    public function reports(): Response
    {
        $daily = Ticket::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('day')
            ->get();

        $firstResponses = DB::table('tickets')
            ->join('ticket_replies', 'tickets.id', '=', 'ticket_replies.ticket_id')
            ->where('ticket_replies.is_internal', false)
            ->selectRaw('tickets.id, MIN(ticket_replies.created_at) as first_reply_at, tickets.created_at as opened_at')
            ->groupBy('tickets.id', 'tickets.created_at')
            ->get();

        $averageResponseMinutes = $firstResponses->isEmpty()
            ? null
            : round($firstResponses->avg(fn ($row) => (strtotime($row->first_reply_at) - strtotime($row->opened_at)) / 60));

        $workload = User::query()
            ->whereIn('role', ['agent', 'admin'])
            ->withCount(['assignedTickets as open_tickets_count' => fn ($query) => $query->whereIn('status', [TicketStatus::Open, TicketStatus::Pending])])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/reports', [
            'ticketsPerDay' => $daily,
            'averageFirstResponseMinutes' => $averageResponseMinutes,
            'agentWorkload' => $workload,
        ]);
    }
}
