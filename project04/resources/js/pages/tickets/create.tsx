import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = { categories: Array<{ id: number; name: string }> };
export default function TicketCreate({ categories }: Props) {
    const form = useForm({ subject: '', description: '', category_id: '', priority: 'normal', attachments: [] as File[] });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/tickets', { forceFormData: true });
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Tickets', href: '/tickets' },
                { title: 'New ticket', href: '/tickets/create' },
            ]}
        >
            <Head title="New ticket" />
            <div className="max-w-3xl p-4">
                <h1 className="text-3xl font-semibold">Open a ticket</h1>
                <p className="text-muted-foreground mt-2">Tell our support team what happened.</p>
                <form onSubmit={submit} className="bg-card mt-8 space-y-5 rounded-xl border p-6">
                    <label className="block space-y-2">
                        <span className="font-medium">Subject</span>
                        <input
                            value={form.data.subject}
                            onChange={(e) => form.setData('subject', e.target.value)}
                            className="bg-background w-full rounded-md border px-3 py-2"
                        />
                        {form.errors.subject && <span className="text-destructive text-sm">{form.errors.subject}</span>}
                    </label>
                    <label className="block space-y-2">
                        <span className="font-medium">Category</span>
                        <select
                            value={form.data.category_id}
                            onChange={(e) => form.setData('category_id', e.target.value)}
                            className="bg-background w-full rounded-md border px-3 py-2"
                        >
                            <option value="">Choose a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.category_id && <span className="text-destructive text-sm">{form.errors.category_id}</span>}
                    </label>
                    <label className="block space-y-2">
                        <span className="font-medium">Priority</span>
                        <select
                            value={form.data.priority}
                            onChange={(e) => form.setData('priority', e.target.value)}
                            className="bg-background w-full rounded-md border px-3 py-2"
                        >
                            {['low', 'normal', 'high', 'urgent'].map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block space-y-2">
                        <span className="font-medium">Description</span>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={7}
                            className="bg-background w-full rounded-md border px-3 py-2"
                        />
                        {form.errors.description && <span className="text-destructive text-sm">{form.errors.description}</span>}
                    </label>
                    <label className="block space-y-2">
                        <span className="font-medium">Attachments</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.txt"
                            onChange={(e) => form.setData('attachments', Array.from(e.target.files ?? []))}
                        />
                        {form.errors.attachments && <span className="text-destructive text-sm">{form.errors.attachments}</span>}
                    </label>
                    <div className="flex gap-3">
                        <Link href="/tickets" className="rounded-md border px-4 py-2">
                            Cancel
                        </Link>
                        <button disabled={form.processing} className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-semibold">
                            {form.processing ? 'Submitting…' : 'Submit ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
