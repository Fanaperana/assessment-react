<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Http\Requests\AssignTicketRequest;
use App\Http\Requests\StoreReplyRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $service) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $tickets = Ticket::query()->with(['creator:id,name,email', 'assignee:id,name', 'category:id,name'])->withCount('replies')
            ->visibleTo($user)->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->priority, fn ($q, $v) => $q->where('priority', $v))->when($request->category, fn ($q, $v) => $q->where('category_id', $v))
            ->when($request->assignee && $user->isAgent(), fn ($q, $v) => $q->where('assignee_id', $v))->search($request->search)
            ->orderBy($request->input('sort', 'created_at'), $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc')->paginate(12)->withQueryString();
        return Inertia::render('tickets/index', ['tickets' => $tickets, 'filters' => $request->only(['status', 'priority', 'category', 'assignee', 'search', 'sort', 'direction']), 'categories' => Category::orderBy('name')->get(['id', 'name']), 'agents' => $user->isAgent() ? User::whereIn('role', ['agent', 'admin'])->get(['id', 'name']) : [], 'can' => ['create' => $user->can('create', Ticket::class)]]);
    }

    public function create(Request $request): Response { return Inertia::render('tickets/create', ['categories' => Category::orderBy('name')->get(['id', 'name'])]); }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $ticket = $this->service->create($request->user(), $request->safe()->except('attachments'), $request->file('attachments', []));
        return to_route('tickets.show', $ticket)->with('success', 'Ticket created.');
    }

    public function show(Request $request, Ticket $ticket): Response
    {
        abort_unless($request->user()->isAgent() || $ticket->created_by_id === $request->user()->id, 404);
        $this->authorize('view', $ticket);
        $ticket->load(['creator:id,name,email', 'assignee:id,name', 'category:id,name', 'replies.user:id,name,role', 'replies.attachments', 'activities.user:id,name', 'attachments']);
        if (!$request->user()->isAgent()) {
            $ticket->setRelation('replies', $ticket->replies->where('is_internal', false)->values());
            $ticket->setRelation('activities', $ticket->activities->where('type', '!=', 'internal_note')->values());
        }
        return Inertia::render('tickets/show', ['ticket' => $ticket, 'agents' => $request->user()->isAgent() ? User::whereIn('role', ['agent', 'admin'])->get(['id', 'name']) : [], 'can' => ['update' => $request->user()->can('update', $ticket), 'assign' => $request->user()->can('assign', $ticket), 'reply' => $request->user()->can('reply', $ticket), 'internalNote' => $request->user()->can('addInternalNote', $ticket), 'close' => $request->user()->can('close', $ticket)]]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): RedirectResponse { $this->service->update($request->user(), $ticket, $request->validated()); return back()->with('success', 'Ticket updated.'); }
    public function assign(AssignTicketRequest $request, Ticket $ticket): RedirectResponse { $this->service->assign($request->user(), $ticket, $request->validated('assignee_id')); return back()->with('success', 'Assignment updated.'); }

    public function reply(StoreReplyRequest $request, Ticket $ticket): RedirectResponse
    {
        $data = $request->validated();
        if (($data['internal'] ?? false) && !$request->user()->can('addInternalNote', $ticket)) abort(403);
        $this->service->reply($request->user(), $ticket, $data['body'], (bool) ($data['internal'] ?? false), $request->file('attachments', []));
        return back()->with('success', 'Reply added.');
    }

    public function close(Request $request, Ticket $ticket): RedirectResponse
    {
        $this->authorize('close', $ticket);
        $this->service->update($request->user(), $ticket, ['status' => TicketStatus::Closed->value]);
        return back()->with('success', 'Ticket closed.');
    }
}
