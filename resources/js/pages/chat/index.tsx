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
    attachment_url?: string | null;
    created_at?: string | null;
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
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    const loadMessages = (conversation: Conversation) => {
        setSelected(conversation);
        api.get(`/api/conversations/${conversation.id}`).then((r) => {
            setMessages(r.data.messages || []);
        });
    };

    const sendMessage = () => {
        if (!selected) return;
        const form = new FormData();
        form.append('content', content);
        if (attachment) {
            form.append('attachment', attachment);
        }
        api
            .post(`/api/conversations/${selected.id}/messages`, form)
            .then((r) => {
                setMessages((m) => [...m, r.data]);
                setContent('');
                setAttachment(null);
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
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {selected &&
                            messages.map((m) => (
                                <div key={m.id} className={m.is_outgoing ? 'text-right' : ''}>
                                    <div
                                        className={
                                            'inline-block max-w-xs rounded-xl px-3 py-2 ' +
                                            (m.is_outgoing
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-neutral-200 dark:bg-neutral-700')
                                        }
                                    >
                                        {m.content && <p>{m.content}</p>}
                                        {m.attachment_url && (
                                            <a
                                                href={m.attachment_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="underline block mt-1"
                                            >
                                                View attachment
                                            </a>
                                        )}
                                    </div>
                                    {m.created_at && (
                                        <div className="text-xs text-neutral-500 mt-1">
                                            {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                    {selected && (
                        <div className="border-t p-4 space-y-2">
                            <textarea
                                className="w-full border rounded-md p-2"
                                rows={3}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <input
                                type="file"
                                onChange={(e) =>
                                    setAttachment(e.target.files ? e.target.files[0] : null)
                                }
                                accept=".pdf,.jpg,.jpeg,.png,video/*"
                            />
                            <div>
                                <button
                                    onClick={sendMessage}
                                    className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
