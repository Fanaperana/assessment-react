<?php

namespace App\Console\Commands;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Console\Command;

class CheckTicketSla extends Command
{
    protected $signature = 'tickets:check-sla';
    protected $description = 'Mark overdue open tickets as breached in the activity log';

    public function handle(): int
    {
        $count = 0;
        Ticket::query()->whereIn('status', [TicketStatus::Open, TicketStatus::Pending])->whereNotNull('sla_due_at')->where('sla_due_at', '<', now())->with('activities')->each(function (Ticket $ticket) use (&$count): void {
            if ($ticket->activities->contains('type', 'sla_breached')) return;
            $ticket->activities()->create(['type' => 'sla_breached', 'description' => 'SLA target breached.']);
            $count++;
        });
        $this->info("Recorded {$count} SLA breaches.");
        return self::SUCCESS;
    }
}
