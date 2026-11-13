<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by_id', 'assignee_id', 'category_id', 'subject', 'description',
        'status', 'priority', 'sla_due_at', 'sla_breached_at', 'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => TicketStatus::class,
            'priority' => TicketPriority::class,
            'sla_due_at' => 'datetime',
            'sla_breached_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by_id'); }
    public function assignee(): BelongsTo { return $this->belongsTo(User::class, 'assignee_id'); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function replies(): HasMany { return $this->hasMany(TicketReply::class); }
    public function activities(): HasMany { return $this->hasMany(TicketActivity::class); }
    public function attachments(): MorphMany { return $this->morphMany(Attachment::class, 'attachable'); }

    public function scopeOpen(Builder $query): void
    {
        $query->whereIn('status', [TicketStatus::Open, TicketStatus::Pending]);
    }

    public function scopeAssignedTo(Builder $query, User|int $user): void
    {
        $query->where('assignee_id', $user instanceof User ? $user->id : $user);
    }

    public function scopeVisibleTo(Builder $query, User $user): void
    {
        if ($user->isAgent()) return;
        $query->where('created_by_id', $user->id);
    }

    public function scopeSearch(Builder $query, ?string $term): void
    {
        $term = trim((string) $term);
        if ($term === '') return;
        $query->where(fn (Builder $q) => $q
            ->where('subject', 'like', "%{$term}%")
            ->orWhere('description', 'like', "%{$term}%"));
    }
}
