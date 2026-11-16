import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = { ticketId: number; canInternalNote: boolean };

export function TicketReplyForm({ ticketId, canInternalNote }: Props) {
    const reply = useForm<{ body: string; internal: boolean; attachments: File[] }>({ body: '', internal: false, attachments: [] });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        reply.post(`/tickets/${ticketId}/reply`, { forceFormData: true, onSuccess: () => reply.reset() });
    };

    return (
        <form onSubmit={submit} className="bg-card rounded-xl border p-5">
            <textarea
                required
                value={reply.data.body}
                onChange={(event) => reply.setData('body', event.target.value)}
                rows={5}
                placeholder={reply.data.internal ? 'Write an internal note…' : 'Write a reply…'}
                className="bg-background w-full rounded-md border p-3"
            />
            {reply.errors.body && <p className="text-destructive text-sm">{reply.errors.body}</p>}
            <label className="mt-3 block space-y-2 text-sm">
                Attach files (up to 5, 10 MB each)
                <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt"
                    onChange={(event) => reply.setData('attachments', event.target.files ? Array.from(event.target.files) : [])}
                    className="block w-full text-sm"
                />
            </label>
            {reply.errors.attachments && <p className="text-destructive text-sm">{reply.errors.attachments}</p>}
            {reply.progress && (
                <div className="mt-3 space-y-1" aria-live="polite">
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div className="bg-primary h-full transition-all" style={{ width: `${reply.progress.percentage}%` }} />
                    </div>
                    <p className="text-muted-foreground text-xs">Uploading files: {reply.progress.percentage}%</p>
                </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                    {canInternalNote && (
                        <>
                            <input
                                type="checkbox"
                                checked={reply.data.internal}
                                onChange={(event) => reply.setData('internal', event.target.checked)}
                            />
                            Internal note
                        </>
                    )}
                </label>
                <button disabled={reply.processing} className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-semibold">
                    {reply.processing ? 'Sending…' : 'Send reply'}
                </button>
            </div>
        </form>
    );
}
