import AppLayout from '@/layouts/app-layout';
import type { Paginated, Ticket } from '@/types/tickets';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Props = {
    tickets: Paginated<Ticket>;
    filters: Record<string, string | undefined>;
    categories: Array<{ id: number; name: string }>;
    agents: Array<{ id: number; name: string }>;
    can: { create: boolean };
};

export default function TicketIndex({ tickets, filters, categories, agents, can }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const apply = (key: string, value: string) =>
        router.get('/tickets', { ...filters, [key]: value || undefined }, { preserveState: true, preserveScroll: true });
    return (
        <AppLayout breadcrumbs={[{ title: 'Tickets', href: '/tickets' }]}>
            <Head title="Tickets" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-muted-foreground text-sm">HelpDesk workspace</p>
                        <h1 className="text-3xl font-semibold">Tickets</h1>
                    </div>
                    {can.create && (
                        <Link href="/tickets/create" className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold">
                            New ticket
                        </Link>
                    )}
                </div>
                <div className="bg-card grid gap-3 rounded-xl border p-4 md:grid-cols-7">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && apply('search', search)}
                        placeholder="Search tickets"
                        className="bg-background rounded-md border px-3 py-2 text-sm"
                    />
                    <select
                        defaultValue={filters.status ?? ''}
                        onChange={(e) => apply('status', e.target.value)}
                        className="bg-background rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All statuses</option>
                        {['open', 'pending', 'resolved', 'closed'].map((v) => (
                            <option key={v}>{v}</option>
                        ))}
                    </select>
                    <select
                        defaultValue={filters.priority ?? ''}
                        onChange={(e) => apply('priority', e.target.value)}
                        className="bg-background rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All priorities</option>
                        {['low', 'normal', 'high', 'urgent'].map((v) => (
                            <option key={v}>{v}</option>
                        ))}
                    </select>
                    <select
                        defaultValue={filters.category ?? ''}
                        onChange={(e) => apply('category', e.target.value)}
                        className="bg-background rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {agents.length > 0 && (
                        <select
                            defaultValue={filters.assignee ?? ''}
                            onChange={(e) => apply('assignee', e.target.value)}
                            className="bg-background rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">All assignees</option>
                            {agents.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filters.sort ?? 'created_at'}
                        onChange={(e) => apply('sort', e.target.value)}
                        aria-label="Sort tickets by"
                        className="bg-background rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="created_at">Date created</option>
                        <option value="updated_at">Recently updated</option>
                        <option value="subject">Subject</option>
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                    </select>
                    <select
                        value={filters.direction ?? 'desc'}
                        onChange={(e) => apply('direction', e.target.value)}
                        aria-label="Sort direction"
                        className="bg-background rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
                <div className="bg-card overflow-hidden rounded-xl border">
                    <div className="divide-y">
                        {tickets.data.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/tickets/${ticket.id}`}
                                className="hover:bg-muted/40 flex flex-wrap items-center justify-between gap-4 p-5"
                            >
                                <div>
                                    <p className="font-semibold">{ticket.subject}</p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        #{ticket.id} · {ticket.category?.name} · {ticket.replies_count ?? 0} replies
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs uppercase">
                                    <span className="bg-muted rounded-full px-3 py-1">{ticket.status}</span>
                                    <span className="rounded-full border px-3 py-1">{ticket.priority}</span>
                                </div>
                            </Link>
                        ))}
                        {tickets.data.length === 0 && <p className="text-muted-foreground p-8 text-center">No tickets match these filters.</p>}
                    </div>
                    <div className="text-muted-foreground flex justify-between border-t p-4 text-sm">
                        <span>{tickets.total} tickets</span>
                        <div className="flex flex-wrap justify-end gap-2" aria-label="Ticket pagination">
                            {tickets.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url ?? '#'}
                                    preserveState
                                    preserveScroll
                                    aria-current={link.active ? 'page' : undefined}
                                    aria-disabled={!link.url}
                                    className={`rounded px-2 py-1 underline ${!link.url ? 'pointer-events-none opacity-40' : ''} ${link.active ? 'bg-primary text-primary-foreground no-underline' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
