import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import echo from '@/lib/echo';
import Message from './message';

interface Conversation {
    id: number;
    name?: string | null;
    phone_number: string;
}

interface Message {
    id: number;
    content: string;
    is_outgoing: boolean;
    files?: { url: string; type: string }[] | null;
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
    const [conversations, setConversations] = useState(initialConversations);
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');

    // Listen for incoming messages when a conversation is clicked
    useEffect(() => {
        if (!selected) return;

        const channelName = `conversations.${selected.id}`;
        const channel = echo.private(channelName);

        const handler = (e: { conversation: Conversation, message: Message }) => {
            if (e.conversation.id !== selected.id) return;

            setMessages((prevMessages) => [...prevMessages, e.message]);

            const messageContainer = document.querySelector('.message-container');
            if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        };

        channel.listen('.MessageReceived', handler);

        return () => {
            channel.stopListening('MessageReceived');
            echo.leave(channelName);
        };
    }, [selected]);

    console.log('selected', selected);

    const loadMessages = (conversation: Conversation) => {
        setSelected(conversation);
        api.get(`/api/conversations/${conversation.id}`).then((r) => {
            setMessages(r.data.conversation.messages || []);
        });
    };

    const createConversation = () => {
        api.post('/api/conversations', { phone_number: phoneNumber, name })
            .then((r) => {
                setConversations((c) => [...c, r.data]);
                setPhoneNumber('');
                setName('');
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
                <div className="w-60 border-r space-y-4 p-2">
                    <div className="space-y-2">
                        <input
                            className="w-full border rounded-md p-1"
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <input
                            className="w-full border rounded-md p-1"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            onClick={createConversation}
                            className="w-full rounded-md bg-primary px-2 py-1 text-primary-foreground"
                        >
                            Create
                        </button>
                    </div>
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => loadMessages(conv)}
                            className={`block w-full p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 ${selected?.id === conv.id ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
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
                    <div className="flex-1 p-4 max-h-[600px] overflow-y-auto space-y-4">
                        {selected &&
                            messages.map((m) => (
                                <Message key={m.id} message={m} />
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
                            <div className="flex justify-between items-baseline">
                                <input
                                    type="file"
                                    className="border rounded-md p-2 bg-secondary"
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
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
