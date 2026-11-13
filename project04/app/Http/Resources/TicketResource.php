<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $includeInternal = $request->user()?->isAgent() ?? false;
        return [
            'id' => $this->id, 'subject' => $this->subject, 'description' => $this->description,
            'status' => $this->status->value, 'priority' => $this->priority->value,
            'category' => $this->whenLoaded('category', fn () => ['id' => $this->category->id, 'name' => $this->category->name]),
            'creator' => $this->whenLoaded('creator', fn () => ['id' => $this->creator->id, 'name' => $this->creator->name]),
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? ['id' => $this->assignee->id, 'name' => $this->assignee->name] : null),
            'replies' => $this->whenLoaded('replies', fn () => $this->replies->filter(fn ($reply) => $includeInternal || !$reply->is_internal)->values()->map(fn ($reply) => ['id' => $reply->id, 'body' => $reply->body, 'internal' => $reply->is_internal, 'user' => ['id' => $reply->user->id, 'name' => $reply->user->name], 'created_at' => $reply->created_at->toISOString()])),
            'activities' => $this->whenLoaded('activities', fn () => $this->activities->filter(fn ($activity) => $includeInternal || $activity->type !== 'internal_note')->values()),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
