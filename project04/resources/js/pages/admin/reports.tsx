import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = {
    ticketsPerDay: Array<{ day: string; total: number }>;
    averageFirstResponseMinutes: number | null;
    agentWorkload: Array<{ id: number; name: string; open_tickets_count: number }>;
};

export default function AdminReports({ ticketsPerDay, averageFirstResponseMinutes, agentWorkload }: Props) {
    const maxTickets = Math.max(1, ...ticketsPerDay.map((item) => item.total));

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Reports', href: '/admin/reports' },
            ]}
        >
            <Head title="HelpDesk reports" />
            <main className="space-y-6 p-4">
                <h1 className="text-3xl font-semibold">Support reports</h1>
                <section className="bg-card rounded-xl border p-5">
                    <h2 className="text-lg font-semibold">Tickets per day (last 14 days)</h2>
                    <div className="mt-5 flex min-h-52 items-end gap-2" role="img" aria-label="Tickets created per day over the last 14 days">
                        {ticketsPerDay.map(({ day, total }) => (
                            <div key={day} className="flex h-52 min-w-0 flex-1 flex-col items-center justify-end gap-2">
                                <span className="text-xs">{total}</span>
                                <div className="bg-primary w-full rounded-t" style={{ height: `${Math.max(4, (total / maxTickets) * 150)}px` }} />
                                <time className="text-muted-foreground text-[10px]" dateTime={day}>
                                    {day.slice(5)}
                                </time>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="grid gap-6 md:grid-cols-2">
                    <section className="bg-card rounded-xl border p-5">
                        <h2 className="text-lg font-semibold">Average first response</h2>
                        <p className="mt-3 text-3xl font-semibold">
                            {averageFirstResponseMinutes === null ? 'No replies yet' : `${averageFirstResponseMinutes} min`}
                        </p>
                    </section>
                    <section className="bg-card rounded-xl border p-5">
                        <h2 className="text-lg font-semibold">Open tickets per agent</h2>
                        <ul className="mt-3 divide-y">
                            {agentWorkload.map((agent) => (
                                <li key={agent.id} className="flex justify-between py-2">
                                    <span>{agent.name}</span>
                                    <strong>{agent.open_tickets_count}</strong>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
