<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReplyRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\TicketReplyResource;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $service) {}

    public function index(Request $request)
    {
        $tickets = Ticket::query()->with(['creator:id,name', 'assignee:id,name', 'category:id,name'])->visibleTo($request->user())->search($request->string('search')->toString())->latest()->paginate(20);
        return TicketResource::collection($tickets);
    }

    public function show(Request $request, Ticket $ticket): TicketResource
    {
        abort_unless($request->user()->isAgent() || $ticket->created_by_id === $request->user()->id, 404);
        $this->authorize('view', $ticket);
        return new TicketResource($ticket->load(['creator:id,name', 'assignee:id,name', 'category:id,name', 'replies.user:id,name', 'activities']));
    }

    public function store(StoreTicketRequest $request): TicketResource
    {
        $ticket = $this->service->create($request->user(), $request->safe()->except('attachments'), $request->file('attachments', []));
        return new TicketResource($ticket->load(['creator', 'category']));
    }

    public function reply(StoreReplyRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('reply', $ticket);
        $data = $request->validated();
        abort_if($data['internal'] ?? false, 403, 'Internal notes are not available through this endpoint.');
        $this->service->reply($request->user(), $ticket, $data['body'], false, $request->file('attachments', []));
        return response()->json(new TicketReplyResource($ticket->replies()->latest()->first()), 201);
    }
}
