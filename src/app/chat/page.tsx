'use client';

import { useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';


export interface Message {
    type: 'user' | 'ai';
    content: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
}

export default function ChatPage() {
    const [message, setMessage] = useState('');
    const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const createNewChat = () => {
        const newSessionId = Date.now().toString();
        setCurrentSessionId(newSessionId);
        setCurrentMessages([]);
        setIsSidebarOpen(false);
    };

    const loadChatSession = (sessionId: string) => {
        const session = chatSessions.find((s) => s.id === sessionId);
        if (session) {
            setCurrentSessionId(sessionId);
            setCurrentMessages(session.messages);
            setIsSidebarOpen(false);
        }
    };

    const saveChatSession = (messages: Message[]) => {
        if (messages.length === 0) return;

        const title =
            messages[0].content.slice(0, 30) +
            (messages[0].content.length > 30 ? '...' : '');
        const sessionId = currentSessionId || Date.now().toString();

        setChatSessions((prev) => {
            const existingIndex = prev.findIndex((s) => s.id === sessionId);
            const updatedSession: ChatSession = {
                id: sessionId,
                title,
                messages,
                createdAt: new Date(),
            };

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = updatedSession;
                return updated;
            } else {
                return [updatedSession, ...prev];
            }
        });

        if (!currentSessionId) {
            setCurrentSessionId(sessionId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessages = [
                ...currentMessages,
                { type: 'user' as const, content: message },
            ];
            setCurrentMessages(newMessages);

            // Giả lập AI trả lời
            setTimeout(() => {
                const updatedMessages = [
                    ...newMessages,
                    {
                        type: 'ai' as const,
                        content:
                            '“Nhận thức là quá trình phản ánh thế giới khách quan trong tư duy con người.” — Triết học',
                    },
                ];
                setCurrentMessages(updatedMessages);
                saveChatSession(updatedMessages);
            }, 1000);

            setMessage('');
            saveChatSession(newMessages);
        }
    };

    return (
        <div className="h-screen flex bg-philo-bg font-sans">
            {/* Sidebar */}
            <ChatSidebar
                chatSessions={chatSessions}
                currentSessionId={currentSessionId}
                createNewChat={createNewChat}
                loadChatSession={loadChatSession}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="lg:hidden flex items-center p-4 bg-philo-header border-b border-philo-border">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-philo-title hover:text-philo-accent mr-4 p-2 rounded-lg hover:bg-philo-hover transition-all duration-200 hover:scale-110 group"
                    >
                        <svg
                            className="w-6 h-6 transition-transform duration-200 group-hover:rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-philo-title italic">
                        Lý luận nhận thức
                    </h1>
                </div>

                {/* Chat Container */}
                <div
                    className="relative flex-1 flex flex-col max-h-screen bg-contain bg-center bg-no-repeat"
                    style={{
                        backgroundImage:
                            "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')",
                    }}
                >
                    {/* Overlay tối nền */}
                    <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

                    {/* Nội dung chat nằm trên overlay */}
                    <div className="relative flex-1 flex flex-col">
                        {currentMessages.length === 0 && (
                            <div className="text-center py-6 border-b border-[#c9a9a6] bg-[#f9f4e7]/90 backdrop-blur-sm">
                                <div className="flex justify-center items-center mb-4">
                                    <div className="bg-[#e8dcc3] text-[#3a2c1a] p-3 rounded-lg border border-[#c9a9a6]">
                                        <svg
                                            className="w-8 h-8"
                                            fill="none"
                                            stroke="#3a2c1a"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <rect x="3" y="4" width="18" height="16" rx="2" />
                                            <path d="M7 4v16" />
                                        </svg>
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-[#3a2c1a] mb-2">Lý luận nhận thức</h1>
                                <div className="text-sm text-[#3a2c1a]/70 italic">
                                    "Triết học là nghệ thuật đặt câu hỏi và lý giải nhận thức"
                                </div>
                            </div>
                        )}

                        {currentMessages.length > 0 && (
                            <div className="flex items-center justify-center p-4 border-b border-[#c9a9a6] bg-[#f9f4e7]/90 backdrop-blur-sm">
                                <h2 className="text-lg font-semibold text-[#3a2c1a] italic">Lý luận nhận thức</h2>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto">
                            <ChatMessages currentMessages={currentMessages} setMessage={setMessage} />
                        </div>

                        <div className="border-t border-[#c9a9a6] bg-[#f9f4e7]/90 backdrop-blur-sm">
                            <ChatInput message={message} setMessage={setMessage} handleSubmit={handleSubmit} />
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
