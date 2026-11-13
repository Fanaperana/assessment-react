import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

type Props = { users: { data: Array<{ id: number; name: string; email: string; role: string }> }; categories: Array<{ id: number; name: string }> };
export default function AdminIndex({ users, categories }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href: '/admin' }]}>
            <Head title="Admin" />
            <div className="space-y-8 p-4">
                <div>
                    <h1 className="text-3xl font-semibold">Administration</h1>
                    <p className="text-muted-foreground mt-2">Manage access and support categories.</p>
                </div>
                <section className="bg-card rounded-xl border p-5">
                    <h2 className="mb-4 text-lg font-semibold">Users and roles</h2>
                    <div className="divide-y">
                        {users.data.map((user) => (
                            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <span>
                                    <strong>{user.name}</strong>
                                    <span className="text-muted-foreground ml-3 text-sm">{user.email}</span>
                                </span>
                                <select
                                    defaultValue={user.role}
                                    onChange={(e) => router.patch(`/admin/users/${user.id}`, { role: e.target.value })}
                                    className="bg-background rounded-md border px-3 py-2 text-sm"
                                >
                                    {['customer', 'agent', 'admin'].map((role) => (
                                        <option key={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="bg-card rounded-xl border p-5">
                    <h2 className="mb-4 text-lg font-semibold">Categories</h2>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <span key={category.id} className="bg-muted rounded-full px-3 py-1 text-sm">
                                {category.name}
                            </span>
                        ))}
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement;
                            router.post('/admin/categories', { name: input.value });
                            input.value = '';
                        }}
                        className="mt-5 flex gap-2"
                    >
                        <input name="name" required placeholder="New category" className="bg-background rounded-md border px-3 py-2" />
                        <button className="bg-primary text-primary-foreground rounded-md px-4 py-2">Add</button>
                    </form>
                </section>
            </div>
        </AppLayout>
    );
}
