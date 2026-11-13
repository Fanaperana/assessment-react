import AppLayout from '@/layouts/app-layout';
import type { Ticket } from '@/types/tickets';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = {
    ticket: Ticket;
    agents: Array<{ id: number; name: string }>;
    can: { update: boolean; assign: boolean; reply: boolean; internalNote: boolean; close: boolean };
};
export default function TicketShow({ ticket, agents, can }: Props) {
    const reply = useForm<{ body: string; internal: boolean; attachments: File[] }>({ body: '', internal: false, attachments: [] });
    const update = useForm({ status: ticket.status, priority: ticket.priority });
    const assign = useForm({ assignee_id: ticket.assignee?.id?.toString() ?? '' });
    const submitReply = (e: FormEvent) => {
        e.preventDefault();
        reply.post(`/tickets/${ticket.id}/reply`, { forceFormData: true, onSuccess: () => reply.reset() });
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Tickets', href: '/tickets' },
                { title: `#${ticket.id}`, href: `/tickets/${ticket.id}` },
            ]}
        >
            <Head title={`Ticket #${ticket.id}`} />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link href="/tickets" className="text-muted-foreground text-sm">
                            ← Back to tickets
                        </Link>
                        <h1 className="mt-2 text-3xl font-semibold">{ticket.subject}</h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            #{ticket.id} · {ticket.category?.name} · opened by {ticket.creator?.name}
                        </p>
                    </div>
                    {can.close && ticket.status !== 'closed' && (
                        <button onClick={() => update.patch(`/tickets/${ticket.id}/close`)} className="rounded-md border px-4 py-2 text-sm">
                            Close ticket
                        </button>
                    )}
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <section className="space-y-4">
                        <article className="bg-card rounded-xl border p-6">
                            <p className="whitespace-pre-wrap">{ticket.description}</p>
                        </article>
                        {ticket.replies?.map((reply) => (
                            <article
                                key={reply.id}
                                className={`rounded-xl border p-5 ${reply.is_internal ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'bg-card'}`}
                            >
                                <div className="flex justify-between text-sm">
                                    <strong>{reply.user.name}</strong>
                                    <span className="text-muted-foreground">
                                        {reply.is_internal ? 'Internal note' : 'Reply'} · {new Date(reply.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="mt-3 whitespace-pre-wrap">{reply.body}</p>
                            </article>
                        ))}
                        {ticket.activities?.map((activity) => (
                            <p key={activity.id} className="text-muted-foreground text-center text-xs">
                                {activity.description} · {new Date(activity.created_at).toLocaleString()}
                            </p>
                        ))}
                        {can.reply && (
                            <form onSubmit={submitReply} className="bg-card rounded-xl border p-5">
                                <textarea
                                    required
                                    value={reply.data.body}
                                    onChange={(e) => reply.setData('body', e.target.value)}
                                    rows={5}
                                    placeholder={reply.data.internal ? 'Write an internal note…' : 'Write a reply…'}
                                    className="bg-background w-full rounded-md border p-3"
                                />
                                {reply.errors.body && <p className="text-destructive text-sm">{reply.errors.body}</p>}
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        {can.internalNote && (
                                            <>
                                                <input
                                                    type="checkbox"
                                                    checked={reply.data.internal}
                                                    onChange={(e) => reply.setData('internal', e.target.checked)}
                                                />{' '}
                                                Internal note
                                            </>
                                        )}
                                    </label>
                                    <button
                                        disabled={reply.processing}
                                        className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-semibold"
                                    >
                                        {reply.processing ? 'Sending…' : 'Send reply'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                    <aside className="bg-card h-fit space-y-4 rounded-xl border p-5">
                        <label className="block space-y-2 text-sm font-medium">
                            Status
                            <select
                                disabled={!can.update}
                                value={update.data.status}
                                onChange={(e) => {
                                    update.setData('status', e.target.value as typeof ticket.status);
                                    update.patch(`/tickets/${ticket.id}`);
                                }}
                                className="bg-background mt-1 w-full rounded-md border px-3 py-2"
                            >
                                {['open', 'pending', 'resolved', 'closed'].map((value) => (
                                    <option key={value}>{value}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block space-y-2 text-sm font-medium">
                            Priority
                            <select
                                disabled={!can.update}
                                value={update.data.priority}
                                onChange={(e) => {
                                    update.setData('priority', e.target.value as typeof ticket.priority);
                                    update.patch(`/tickets/${ticket.id}`);
                                }}
                                className="bg-background mt-1 w-full rounded-md border px-3 py-2"
                            >
                                {['low', 'normal', 'high', 'urgent'].map((value) => (
                                    <option key={value}>{value}</option>
                                ))}
                            </select>
                        </label>
                        {can.assign && (
                            <label className="block space-y-2 text-sm font-medium">
                                Assignee
                                <select
                                    value={assign.data.assignee_id}
                                    onChange={(e) => {
                                        assign.setData('assignee_id', e.target.value);
                                        assign.patch(`/tickets/${ticket.id}/assign`);
                                    }}
                                    className="bg-background mt-1 w-full rounded-md border px-3 py-2"
                                >
                                    <option value="">Unassigned</option>
                                    {agents.map((agent) => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
