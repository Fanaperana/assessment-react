<?php

use App\Enums\Role;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use App\Policies\TicketPolicy;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use App\Notifications\TicketCreatedNotification;
use Laravel\Sanctum\Sanctum;

it('lets a customer view their own ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $user->id]);
    $this->actingAs($user)->get("/tickets/{$ticket->id}")->assertOk();
});

it('returns not found when a customer views another customer ticket', function () {
    $ticket = Ticket::factory()->create();
    $this->actingAs(User::factory()->create())->get("/tickets/{$ticket->id}")->assertNotFound();
});

it('lets agents see every ticket', function () {
    $agent = User::factory()->agent()->create();
    $ticket = Ticket::factory()->create();
    $this->actingAs($agent)->get("/tickets/{$ticket->id}")->assertOk();
});

it('hides internal notes from customers', function () {
    $customer = User::factory()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $customer->id]);
    $ticket->replies()->create(['user_id' => User::factory()->agent()->create()->id, 'body' => 'secret', 'is_internal' => true]);
    $this->actingAs($customer)->getJson("/api/tickets/{$ticket->id}")->assertOk()->assertJsonMissing(['body' => 'secret']);
});

it('rejects an internal note from a customer', function () {
    $customer = User::factory()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $customer->id]);
    $this->actingAs($customer)->post("/tickets/{$ticket->id}/reply", ['body' => 'secret', 'internal' => true])->assertForbidden();
});

it('records ticket activity on creation', function () {
    Notification::fake();
    User::factory()->agent()->create();
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $this->actingAs($user)->post('/tickets', ['subject' => 'Printer issue', 'description' => 'The printer is not working today.', 'category_id' => $category->id, 'priority' => 'high'])->assertRedirect();
    expect(\App\Models\TicketActivity::query()->where('type', 'created')->exists())->toBeTrue();
    Notification::assertSentTo(User::whereIn('role', ['agent', 'admin'])->first(), TicketCreatedNotification::class);
});

it('validates required ticket fields', function () {
    $this->actingAs(User::factory()->create())->post('/tickets', [])->assertSessionHasErrors(['subject', 'description', 'category_id', 'priority']);
});

it('assigns a ticket to an agent', function () {
    $agent = User::factory()->agent()->create();
    $ticket = Ticket::factory()->create();
    $this->actingAs($agent)->patch("/tickets/{$ticket->id}/assign", ['assignee_id' => $agent->id])->assertRedirect();
    expect($ticket->fresh()->assignee_id)->toBe($agent->id);
});

it('allows a customer to close their ticket', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $user->id]);
    $this->actingAs($user)->patch("/tickets/{$ticket->id}/close")->assertRedirect();
    expect($ticket->fresh()->status)->toBe(TicketStatus::Closed);
});

it('stores uploads on the private disk', function () {
    Storage::fake('private');
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $file = UploadedFile::fake()->create('error.txt', 10, 'text/plain');
    $this->actingAs($user)->post('/tickets', ['subject' => 'Attachment', 'description' => 'Please inspect this attached log file.', 'category_id' => $category->id, 'priority' => 'normal', 'attachments' => [$file]])->assertRedirect();
    Storage::disk('private')->assertExists(\App\Models\Attachment::first()->path);
});

it('filters customer tickets to their own records', function () {
    $user = User::factory()->create();
    Ticket::factory(2)->create(['created_by_id' => $user->id]);
    Ticket::factory(3)->create();
    $this->actingAs($user)->get('/tickets')->assertOk()->assertInertia(fn ($page) => $page->has('tickets.data', 2));
});

it('paginates tickets for agents', function () {
    $agent = User::factory()->agent()->create();
    Ticket::factory(25)->create();
    $this->actingAs($agent)->get('/tickets')->assertOk()->assertInertia(fn ($page) => $page->where('tickets.per_page', 12));
});

it('supports server-side search', function () {
    $user = User::factory()->create();
    Ticket::factory()->create(['created_by_id' => $user->id, 'subject' => 'VPN access']);
    Ticket::factory()->create(['created_by_id' => $user->id, 'subject' => 'Laptop request']);
    $this->actingAs($user)->get('/tickets?search=VPN')->assertInertia(fn ($page) => $page->has('tickets.data', 1));
});

it('queues notifications for ticket creation', function () {
    Queue::fake();
    User::factory()->agent()->create();
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $this->actingAs($user)->post('/tickets', ['subject' => 'Queued ticket', 'description' => 'This ticket should notify agents.', 'category_id' => $category->id, 'priority' => 'normal']);
    Queue::assertPushed(\Illuminate\Notifications\SendQueuedNotifications::class);
});

it('protects the admin area', function () {
    $this->actingAs(User::factory()->agent()->create())->get('/admin')->assertForbidden();
});

it('lists tickets through the Sanctum API', function () {
    $user = User::factory()->create();
    Ticket::factory(2)->create(['created_by_id' => $user->id]);
    Sanctum::actingAs($user);
    $this->getJson('/api/tickets')->assertOk()->assertJsonCount(2, 'data');
});

it('rejects unauthenticated API requests', function () {
    $this->getJson('/api/tickets')->assertUnauthorized();
});

it('creates a ticket through the Sanctum API', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    Sanctum::actingAs($user);
    $this->postJson('/api/tickets', ['subject' => 'API request', 'description' => 'Created through the public API.', 'category_id' => $category->id, 'priority' => 'normal'])->assertCreated()->assertJsonPath('data.subject', 'API request');
});

it('adds public replies through the Sanctum API', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $user->id]);
    Sanctum::actingAs($user);
    $this->postJson("/api/tickets/{$ticket->id}/replies", ['body' => 'Here is an update.'])->assertCreated()->assertJsonPath('data.body', 'Here is an update.');
});

it('allows admins to manage categories', function () {
    $this->actingAs(User::factory()->admin()->create())->post('/admin/categories', ['name' => 'Hardware'])->assertRedirect();
    expect(Category::where('slug', 'hardware')->exists())->toBeTrue();
});

it('notifies a customer only when an agent sends a public reply', function () {
    Notification::fake();
    $customer = User::factory()->create();
    $agent = User::factory()->agent()->create();
    $ticket = Ticket::factory()->create(['created_by_id' => $customer->id]);

    $this->actingAs($customer)->post("/tickets/{$ticket->id}/reply", ['body' => 'Customer update'])->assertRedirect();
    Notification::assertNothingSent();

    $this->actingAs($agent)->post("/tickets/{$ticket->id}/reply", ['body' => 'Agent response'])->assertRedirect();
    Notification::assertSentTo($customer, \App\Notifications\AgentReplyNotification::class);
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

    $attachment = \App\Models\Attachment::query()->firstOrFail();
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
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'type' => TicketCreatedNotification::class,
        'data' => ['message' => 'A new ticket was created.'],
    ]);

    $this->actingAs($user)->get('/dashboard')->assertInertia(fn ($page) => $page->where('notifications.unread', 1));
    $this->actingAs($user)->post('/notifications/read')->assertRedirect();
    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

it('covers every ticket policy capability for customer and agent roles', function () {
    $policy = new TicketPolicy();
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
