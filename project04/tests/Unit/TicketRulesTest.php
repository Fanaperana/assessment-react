<?php

use App\Enums\Role;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

it('has the expected role values', function () { expect(Role::cases())->toHaveCount(3); });
it('has the expected status values', function () { expect(TicketStatus::cases())->toHaveCount(4); });
it('has the expected priority values', function () { expect(TicketPriority::cases())->toHaveCount(4); });
it('recognizes agents', function () { expect(User::factory()->agent()->make()->isAgent())->toBeTrue(); });
it('recognizes admins as agents', function () { expect(User::factory()->admin()->make()->isAgent())->toBeTrue(); });
it('does not recognize customers as agents', function () { expect(User::factory()->make()->isAgent())->toBeFalse(); });
it('recognizes admins', function () { expect(User::factory()->admin()->make()->isAdmin())->toBeTrue(); });
it('calculates urgent SLA in four hours', function () { expect(now()->diffInHours(now()->addHours(4)))->toBe(4); });
it('calculates normal SLA in seventy two hours', function () { expect(now()->diffInHours(now()->addHours(72)))->toBe(72); });
it('uses the open scope for pending tickets', function () { $query = Ticket::query()->open()->toSql(); expect($query)->toContain('status'); });
it('uses the assignment scope', function () { $query = Ticket::query()->assignedTo(4)->toSql(); expect($query)->toContain('assignee_id'); });
it('uses the search scope', function () { $query = Ticket::query()->search('printer')->toSql(); expect($query)->toContain('subject'); });
