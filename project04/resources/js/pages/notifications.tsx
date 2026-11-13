import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Props = {
    notifications: { data: Array<{ id: string; data: { message?: string; ticket_id?: number }; read_at: string | null; created_at: string }> };
};
export default function Notifications({ notifications }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Notifications', href: '/notifications' }]}>
            <Head title="Notifications" />
            <div className="max-w-3xl space-y-5 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold">Notifications</h1>
                    <button onClick={() => router.post('/notifications/read')} className="text-primary text-sm hover:underline">
                        Mark all as read
                    </button>
                </div>
                <div className="bg-card divide-y rounded-xl border">
                    {notifications.data.map((notification) => (
                        <div key={notification.id} className={`p-5 ${notification.read_at ? '' : 'bg-primary/5'}`}>
                            <p>{notification.data.message}</p>
                            {notification.data.ticket_id && (
                                <Link
                                    href={`/tickets/${notification.data.ticket_id}`}
                                    className="text-primary mt-2 inline-block text-sm hover:underline"
                                >
                                    Open ticket
                                </Link>
                            )}
                            <p className="text-muted-foreground mt-1 text-xs">{new Date(notification.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                    {notifications.data.length === 0 && <p className="text-muted-foreground p-8 text-center">No notifications yet.</p>}
                </div>
            </div>
        </AppLayout>
    );
}
