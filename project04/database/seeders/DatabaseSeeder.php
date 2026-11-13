<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categories = collect(['Account', 'Billing', 'Technical', 'General'])
            ->mapWithKeys(fn (string $name) => [$name => Category::firstOrCreate(
                ['slug' => str($name)->slug()], ['name' => $name],
            )]);

        $admin = User::factory()->admin()->create([
            'name' => 'Amina Admin', 'email' => 'admin@helpdesk.test',
        ]);
        $agents = User::factory(3)->agent()->create();
        $customers = User::factory(10)->create();

        Ticket::factory(60)->recycle($categories->values())->create([
            'created_by_id' => fn () => $customers->random()->id,
            'assignee_id' => fn () => fake()->boolean(70) ? $agents->random()->id : null,
            'category_id' => fn () => $categories->random()->id,
        ])->each(function (Ticket $ticket) use ($agents, $admin): void {
            $ticket->update(['status' => fake()->randomElement(TicketStatus::cases()), 'priority' => fake()->randomElement(TicketPriority::cases())]);
            $ticket->replies()->createMany([
                ['user_id' => $ticket->created_by_id, 'body' => fake()->paragraph(), 'is_internal' => false],
                ['user_id' => $ticket->assignee_id ?? $agents->random()->id, 'body' => fake()->paragraph(), 'is_internal' => false],
            ]);
            TicketActivity::create([
                'ticket_id' => $ticket->id, 'user_id' => $admin->id,
                'type' => 'created', 'description' => 'Ticket was created.',
            ]);
        });
    }
}
