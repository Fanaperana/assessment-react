export type Attachment = { id: number; original_name: string; mime_type: string; size: number };

export type Ticket = {
    id: number;
    subject: string;
    description: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category?: { id: number; name: string };
    creator?: { id: number; name: string; email?: string };
    assignee?: { id: number; name: string } | null;
    replies?: Reply[];
    activities?: Activity[];
    attachments?: Attachment[];
    created_at: string;
    replies_count?: number;
};

export type Reply = {
    id: number;
    body: string;
    is_internal: boolean;
    user: { id: number; name: string; role?: string };
    created_at: string;
    attachments?: Attachment[];
};
export type Activity = { id: number; type: string; description: string; user?: { name: string } | null; created_at: string };
export type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
};
