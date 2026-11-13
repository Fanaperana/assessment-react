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
    created_at: string;
    replies_count?: number;
};

export type Reply = { id: number; body: string; is_internal: boolean; user: { id: number; name: string; role?: string }; created_at: string };
export type Activity = { id: number; type: string; description: string; user?: { name: string } | null; created_at: string };
export type Paginated<T> = {
    data: T[];
    links: { prev?: string | null; next?: string | null } & Record<string, unknown>;
    current_page: number;
    last_page: number;
    total: number;
};
