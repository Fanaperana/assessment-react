<?php

use App\Enums\Role;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
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
