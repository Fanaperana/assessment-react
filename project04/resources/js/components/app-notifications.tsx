import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

export function AppNotifications() {
    const { props } = usePage<SharedData>();
    const unread = props.notifications?.unread ?? 0;

    return (
        <Link
            href="/notifications"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            className="hover:bg-accent relative inline-flex size-9 items-center justify-center rounded-md"
        >
            <Bell className="size-5" />
            {unread > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 min-w-5 rounded-full px-1 text-center text-xs leading-5">
                    {unread > 99 ? '99+' : unread}
                </span>
            )}
        </Link>
    );
}

export function FlashMessage() {
    const { props } = usePage<SharedData>();

    return props.flash?.success || props.flash?.error ? (
        <div className="mx-auto w-full max-w-7xl px-4 pt-3" role="status" aria-live="polite">
            <p
                className={`rounded-md border px-4 py-3 text-sm ${props.flash.error ? 'border-destructive text-destructive' : 'border-emerald-600/30 text-emerald-700 dark:text-emerald-300'}`}
            >
                {props.flash.error ?? props.flash.success}
            </p>
        </div>
    ) : null;
}
