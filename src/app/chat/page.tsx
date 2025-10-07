'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import ChatSidebar from '../components/ChatSidebar';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import { createChat, getChats, getChatById, sendMessage } from '@/services/chatService';
import 'antd/dist/reset.css';

export interface Message {
    _id?: string;
    type: 'user' | 'ai';
    content: string;
    mediaUrl?: string; // Thêm field cho ảnh
    createdAt?: string;
}

export interface ChatSession {
    _id: string;
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    lastMessage?: string;
}

export default function ChatPage() {
    const [messageText, setMessageText] = useState('');
    const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

    // Load chats when component mounts
    useEffect(() => {
        loadChatSessions();
    }, []);

    const loadChatSessions = async () => {
        try {
            const response = await getChats();
            console.log('Load chats response:', response);

            if (response?.data && Array.isArray(response.data)) {
                const chats = response.data.map((chat: any) => ({
                    _id: chat._id,
                    id: chat._id,
                    title: chat.title || chat.name || 'Cuộc trò chuyện mới',
                    messages: [],
                    createdAt: new Date(chat.createdAt || chat.updatedAt || Date.now()),
                    lastMessage: chat.lastMessage || chat.summary || ''
                }));

                chats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                setChatSessions(chats);
            } else if (response?.data?.data && Array.isArray(response.data.data)) {
                const chats = response.data.data.map((chat: any) => ({
                    _id: chat._id,
                    id: chat._id,
                    title: chat.title || chat.name || 'Cuộc trò chuyện mới',
                    messages: [],
                    createdAt: new Date(chat.createdAt || chat.updatedAt || Date.now()),
                    lastMessage: chat.lastMessage || chat.summary || ''
                }));

                chats.sort((a: ChatSession, b: ChatSession) => b.createdAt.getTime() - a.createdAt.getTime());
                setChatSessions(chats);
            }
        } catch (error: any) {
            console.error('Error loading chats:', error);
            if (error.response?.status === 401) {
                messageApi.error('Phiên đăng nhập đã hết hạn');
                router.push('/login');
            } else {
                messageApi.error('Không thể tải danh sách chat');
            }
        }
    };

    const createNewChat = async () => {
        setCurrentSessionId(null);
        setCurrentMessages([]);
        setIsSidebarOpen(false);
    };

    const loadChatSession = async (sessionId: string) => {
        try {
            setLoading(true);
            const response = await getChatById(sessionId);

            console.log('Load chat response:', response);

            if (response?.data) {
                let messages = [];

                if (Array.isArray(response.data)) {
                    messages = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    messages = response.data.data;
                } else if (response.data.messages && Array.isArray(response.data.messages)) {
                    messages = response.data.messages;
                }

                const formattedMessages = messages.map((msg: any) => ({
                    _id: msg._id,
                    type: msg.role === 'user' ? 'user' : 'ai',
                    content: msg.content,
                    mediaUrl: msg.mediaUrl, // Đảm bảo mediaUrl được mapping
                    createdAt: msg.createdAt
                }));

                console.log('Formatted messages:', formattedMessages); // Debug log

                setCurrentSessionId(sessionId);
                setCurrentMessages(formattedMessages);
                setIsSidebarOpen(false);
            }
        } catch (error: any) {
            console.error('Error loading chat session:', error);
            messageApi.error('Không thể tải cuộc trò chuyện');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || loading) return;

        const messageContent = messageText.trim();
        setMessageText('');
        setLoading(true);

        const userMessage: Message = {
            type: 'user',
            content: messageContent,
        };

        setCurrentMessages(prev => [...prev, userMessage]);

        try {
            let response;

            if (currentSessionId) {
                response = await sendMessage(currentSessionId, messageContent);
            } else {
                response = await createChat(messageContent);
            }

            console.log('API Response:', response);

            if (response?.data) {
                const responseData = response.data;

                if (!currentSessionId && responseData.chatId) {
                    const newChatId = responseData.chatId;
                    setCurrentSessionId(newChatId);

                    const newSession: ChatSession = {
                        _id: newChatId,
                        id: newChatId,
                        title: messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : ''),
                        messages: [],
                        createdAt: new Date(),
                        lastMessage: messageContent
                    };

                    setChatSessions(prev => [newSession, ...prev]);
                }

                let aiResponseContent = '';

                if (responseData.assistantMessage && responseData.assistantMessage.content) {
                    aiResponseContent = responseData.assistantMessage.content;
                } else if (responseData.response) {
                    aiResponseContent = responseData.response;
                } else if (responseData.aiResponse) {
                    aiResponseContent = responseData.aiResponse;
                } else {
                    aiResponseContent = 'Phản hồi từ AI';
                }

                const aiMessage: Message = {
                    type: 'ai',
                    content: aiResponseContent,
                };

                setCurrentMessages(prev => [...prev, aiMessage]);

            } else {
                messageApi.error('Không thể gửi tin nhắn');
                setCurrentMessages(prev => prev.slice(0, -1));
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            messageApi.error('Đã xảy ra lỗi khi gửi tin nhắn');

            setCurrentMessages(prev => prev.slice(0, -1));

            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Sửa lại hàm handleImageUploaded
    const handleImageUploaded = async () => {
        console.log('Image uploaded, refreshing messages...');

        // Refresh lại messages của chat hiện tại
        if (currentSessionId) {
            await loadChatSession(currentSessionId);
        }

        // Refresh lại danh sách chat sessions
        await loadChatSessions();

        messageApi.success('Gửi hình ảnh thành công!');
    };

    return (
        <>
            {contextHolder}
            <div className="h-screen flex bg-gradient-to-br from-amber-50 to-orange-100 font-sans overflow-hidden">
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
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center p-4 bg-white/80 backdrop-blur-sm border-b border-amber-200 flex-shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-700 hover:text-amber-600 mr-4 p-2 rounded-lg hover:bg-amber-100 transition-all duration-200 hover:scale-110"
                        >
                            <svg
                                className="w-6 h-6"
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
                        <h1 className="text-lg font-bold text-gray-800 italic">
                            Lý luận nhận thức
                        </h1>
                    </div>

                    {/* Chat Container */}
                    <div
                        className="relative flex-1 flex flex-col min-h-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage:
                                "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')",
                        }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative flex-1 flex flex-col min-h-0">
                            {/* Header when empty */}
                            {currentMessages.length === 0 && (
                                <div className="text-center py-6 border-b border-amber-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
                                    <div className="flex justify-center items-center mb-4">
                                        <div className="bg-amber-100 text-amber-800 p-3 rounded-lg border border-amber-300">
                                            <svg
                                                className="w-8 h-8"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                                <path d="M7 4v16" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Lý luận nhận thức</h1>
                                    <div className="text-sm text-gray-600 italic">
                                        "Triết học là nghệ thuật đặt câu hỏi và lý giải nhận thức"
                                    </div>
                                </div>
                            )}

                            {/* Header when has messages */}
                            {currentMessages.length > 0 && (
                                <div className="flex items-center justify-center p-4 border-b border-amber-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
                                    <h2 className="text-lg font-semibold text-gray-800 italic">Lý luận nhận thức</h2>
                                </div>
                            )}

                            {/* Messages Area - Fixed Height with Scroll */}
                            <div className="flex-1 min-h-0">
                                <ChatMessages
                                    currentMessages={currentMessages}
                                    setMessage={setMessageText}
                                    loading={loading}
                                />
                            </div>

                            {/* Input Area - Fixed at Bottom */}
                            <div className="border-t border-amber-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
                                <ChatInput
                                    message={messageText}
                                    setMessage={setMessageText}
                                    handleSubmit={handleSubmit}
                                    loading={loading}
                                    chatId={currentSessionId ?? undefined} // Truyền chatId
                                    onImageUploaded={handleImageUploaded} // Truyền callback
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
