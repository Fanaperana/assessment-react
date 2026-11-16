<?php

use App\Enums\TicketStatus;
use App\Models\Attachment;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\AgentReplyNotification;
use App\Notifications\TicketCreatedNotification;
use App\Policies\TicketPolicy;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

it('notifies a customer only when an agent sends a public reply', function () {
    Notification::fake();
    $customer = User::factory()->create();
    $agent = User::factory()->agent()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $customer->id]);

    $this->actingAs($customer)->post("/tickets/{$ticket->id}/reply", ['body' => 'Customer update'])->assertRedirect();
    Notification::assertNothingSent();

    $this->actingAs($agent)->post("/tickets/{$ticket->id}/reply", ['body' => 'Agent response'])->assertRedirect();
    Notification::assertSentTo($customer, AgentReplyNotification::class);
});

it('sorts tickets using the requested direction and keeps pagination data', function () {
    $user = User::factory()->agent()->create();
    Ticket::factory()->create(['subject' => 'Alpha']);
    Ticket::factory()->create(['subject' => 'Zulu']);

    $this->actingAs($user)->get('/tickets?sort=subject&direction=asc')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tickets.data.0.subject', 'Alpha')
            ->where('filters.sort', 'subject')
            ->where('filters.direction', 'asc')
            ->has('tickets.links'));
});

it('uses the close policy through a dedicated form request', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $owner->id]);

    $this->actingAs($other)->patch("/tickets/{$ticket->id}/close")->assertForbidden();
    $this->actingAs($owner)->patch("/tickets/{$ticket->id}/close")->assertRedirect();
    expect($ticket->fresh()->status)->toBe(TicketStatus::Closed);
});

it('reports dashboard counts for an agent assigned to them', function () {
    $agent = User::factory()->agent()->create();
    Ticket::factory()->create(['assignee_id' => $agent->id, 'status' => TicketStatus::Open]);
    Ticket::factory()->create(['assignee_id' => null, 'status' => TicketStatus::Open]);

    $this->actingAs($agent)->get('/dashboard')->assertInertia(fn ($page) => $page
        ->where('stats.open', 1)
        ->where('stats.assigned', 1)
        ->where('stats.unassigned', 1));
});

it('shows the admin reports page with workload data', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->agent()->create();

    $this->actingAs($admin)->get('/admin/reports')->assertOk()
        ->assertInertia(fn ($page) => $page->has('ticketsPerDay')->has('agentWorkload', 2));
});

it('uploads reply attachments to private storage and authorizes downloads', function () {
    Storage::fake('private');
    $owner = User::factory()->create();
    $agent = User::factory()->agent()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $owner->id]);
    $file = UploadedFile::fake()->create('diagnostics.txt', 20, 'text/plain');

    $this->actingAs($agent)->post("/tickets/{$ticket->id}/reply", [
        'body' => 'Please review these diagnostics.',
        'attachments' => [$file],
    ])->assertRedirect();

    $attachment = Attachment::query()->firstOrFail();
    Storage::disk('private')->assertExists($attachment->path);
    $this->actingAs($owner)->get("/attachments/{$attachment->id}/download")->assertOk();

    $outsider = User::factory()->create();
    $this->actingAs($outsider)->get("/attachments/{$attachment->id}/download")->assertForbidden();
});

it('records SLA breaches and leaves already breached tickets unchanged', function () {
    $ticket = Ticket::factory()->create([
        'status' => TicketStatus::Open,
        'sla_due_at' => now()->subMinute(),
        'sla_breached_at' => null,
    ]);

    $this->artisan('tickets:check-sla')->assertSuccessful();
    expect($ticket->fresh()->sla_breached_at)->not->toBeNull();
    expect($ticket->activities()->where('type', 'sla_breached')->count())->toBe(1);

    $this->artisan('tickets:check-sla')->assertSuccessful();
    expect($ticket->activities()->where('type', 'sla_breached')->count())->toBe(1);
});

it('shares the notification unread count and allows marking notifications read', function () {
    $user = User::factory()->create();
    $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => TicketCreatedNotification::class,
        'data' => ['message' => 'A new ticket was created.'],
    ]);

    $this->actingAs($user)->get('/dashboard')->assertInertia(fn ($page) => $page->where('notifications.unread', 1));
    $this->actingAs($user)->post('/notifications/read')->assertRedirect();
    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

it('covers every ticket policy capability for customer and agent roles', function () {
    $policy = new TicketPolicy;
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();
    $agent = User::factory()->agent()->create();
    $owned = Ticket::factory()->create(['created_by_id' => $customer->id]);
    $other = Ticket::factory()->create(['created_by_id' => $otherCustomer->id]);

    expect($policy->viewAny($customer))->toBeTrue()
        ->and($policy->view($customer, $owned))->toBeTrue()
        ->and($policy->view($customer, $other))->toBeFalse()
        ->and($policy->create($customer))->toBeTrue()
        ->and($policy->update($customer, $owned))->toBeFalse()
        ->and($policy->assign($customer, $owned))->toBeFalse()
        ->and($policy->reply($customer, $owned))->toBeTrue()
        ->and($policy->addInternalNote($customer, $owned))->toBeFalse()
        ->and($policy->close($customer, $owned))->toBeTrue()
        ->and($policy->update($agent, $other))->toBeTrue()
        ->and($policy->assign($agent, $other))->toBeTrue()
        ->and($policy->addInternalNote($agent, $other))->toBeTrue();
});

it('rejects invalid ticket values using validation datasets', function (array $payload, string $field) {
    $customer = User::factory()->create();
    $category = Category::factory()->create();
    $valid = ['subject' => 'Valid ticket', 'description' => 'A sufficiently long description.', 'category_id' => $category->id, 'priority' => 'normal'];

    $this->actingAs($customer)->post('/tickets', array_merge($valid, $payload))->assertSessionHasErrors($field);
})->with([
    'unknown priority' => [['priority' => 'critical'], 'priority'],
    'missing subject' => [['subject' => ''], 'subject'],
    'missing description' => [['description' => ''], 'description'],
    'unknown category' => [['category_id' => 99999], 'category_id'],
]);
