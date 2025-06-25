import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Conversation {
    id: number;
    name?: string | null;
    phone_number: string;
}

interface Message {
    id: number;
    content: string;
    is_outgoing: boolean;
}

interface Props {
    conversations: Conversation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Chat', href: '/chat' },
];

export default function ChatPage({ conversations: initialConversations }: Props) {
    const [conversations] = useState(initialConversations);
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const loadMessages = (conversation: Conversation) => {
        setSelected(conversation);
        api.get(`/api/conversations/${conversation.id}`).then((r) => {
            setMessages(r.data.messages || []);
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />
            <div className="flex h-full">
                <div className="w-60 border-r">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => loadMessages(conv)}
                            className="block w-full p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <div className="font-medium">
                                {conv.name ?? conv.phone_number}
                            </div>
                            <div className="text-sm text-neutral-500">
                                {conv.phone_number}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                    {selected &&
                        messages.map((m) => (
                            <div key={m.id} className={m.is_outgoing ? 'text-right' : ''}>
                                <span className="inline-block rounded-xl px-3 py-2 bg-neutral-200 dark:bg-neutral-700">
                                    {m.content}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </AppLayout>
    );
}
