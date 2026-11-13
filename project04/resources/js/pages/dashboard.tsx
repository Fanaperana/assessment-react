import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type Props = {
    stats: { open: number; assigned: number; unassigned: number; slaRisk: number };
    recent: Array<{ id: number; subject: string; status: string; priority: string }>;
};

export default function Dashboard({ stats, recent }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    {Object.entries({
                        'Open tickets': stats.open,
                        'My assigned': stats.assigned,
                        Unassigned: stats.unassigned,
                        'SLA risk': stats.slaRisk,
                    }).map(([label, value]) => (
                        <div key={label} className="bg-card rounded-xl border p-5 shadow-sm">
                            <p className="text-muted-foreground text-sm">{label}</p>
                            <p className="mt-2 text-3xl font-semibold">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-card rounded-xl border p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent tickets</h2>
                        <a href="/tickets" className="text-primary text-sm font-medium">
                            View all
                        </a>
                    </div>
                    <div className="divide-y">
                        {recent.map((ticket) => (
                            <a
                                key={ticket.id}
                                href={`/tickets/${ticket.id}`}
                                className="hover:bg-muted/40 flex items-center justify-between gap-4 py-4"
                            >
                                <span>
                                    <span className="block font-medium">{ticket.subject}</span>
                                    <span className="text-muted-foreground text-sm">
                                        #{ticket.id} · {ticket.status}
                                    </span>
                                </span>
                                <span className="bg-muted rounded-full px-3 py-1 text-xs uppercase">{ticket.priority}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
