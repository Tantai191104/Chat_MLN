'use client';

import { ChatSession } from '@/app/chat/page';

interface Props {
    chatSessions: ChatSession[];
    currentSessionId: string | null;
    createNewChat: () => void;
    loadChatSession: (id: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

export default function ChatSidebar({
    chatSessions,
    currentSessionId,
    createNewChat,
    loadChatSession,
    isSidebarOpen,
    setIsSidebarOpen,
}: Props) {
    // Format date cho hiển thị
    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Hôm nay';
        } else if (days === 1) {
            return 'Hôm qua';
        } else if (days < 7) {
            return `${days} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    };

    // Truncate title
    const truncateTitle = (title: string, maxLength = 35) => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 bg-[#2d2d2d] text-white flex flex-col shadow-xl
                 transform transition-all duration-300 ease-out
                 ${isSidebarOpen ? 'translate-x-0 opacity-100 w-72' : '-translate-x-full opacity-0 w-72'}
                 lg:relative lg:translate-x-0 lg:opacity-100 lg:shadow-none ${!isSidebarOpen ? 'lg:w-12 lg:min-w-12' : 'lg:w-72 lg:min-w-72'}`}
                style={{
                    transitionProperty: 'transform, opacity, box-shadow, width, min-width',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Collapsed state - chỉ hiển thị khi đóng trên desktop */}
                {!isSidebarOpen && (
                    <div className="hidden lg:flex flex-col items-center justify-start h-full py-4 px-2">
                        {/* Nút mở sidebar */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group mb-4"
                            title="Mở sidebar"
                        >
                            <svg
                                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
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

                        {/* Icon logo */}
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-110 cursor-pointer">
                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L13.09 8.26L18 7.27L14.18 12L18 16.73L13.09 15.74L12 22L10.91 15.74L6 16.73L9.82 12L6 7.27L10.91 8.26L12 2Z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Expanded state - hiển thị toàn bộ nội dung */}
                {isSidebarOpen && (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-110">
                                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L13.09 8.26L18 7.27L14.18 12L18 16.73L13.09 15.74L12 22L10.91 15.74L6 16.73L9.82 12L6 7.27L10.91 8.26L12 2Z" />
                                    </svg>
                                </div>
                                <div className="flex-1"></div>
                                {/* Nút đóng sidebar cho cả mobile và desktop */}
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90 p-1 rounded-lg hover:bg-white/10"
                                    title="Đóng sidebar"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Menu chính */}
                        <div className="px-3 py-2 space-y-1">
                            <button
                                onClick={createNewChat}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5"
                            >
                                <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="font-medium text-sm">Đoạn chat mới</span>
                            </button>

                            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5">
                                <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <span className="font-medium text-sm">Tìm kiếm đoạn chat</span>
                            </button>
                        </div>

                        {/* Label nhóm */}
                        <div className="px-4 pt-6 pb-2">
                            <h3 className="text-xs text-white/60 font-semibold tracking-wide uppercase transition-colors duration-200 hover:text-white/80">
                                Đoạn chat ({chatSessions.length})
                            </h3>
                        </div>

                        {/* Danh sách chat */}
                        <div className="flex-1 px-3 pb-2 overflow-y-auto custom-scrollbar">
                            {chatSessions.length === 0 ? (
                                <div className="text-center text-white/40 mt-8 px-3">
                                    <div className="mb-4">
                                        <svg className="w-12 h-12 mx-auto text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium mb-1">Chưa có đoạn chat nào</p>
                                    <p className="text-xs text-white/30">Bắt đầu cuộc trò chuyện đầu tiên</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {chatSessions.map((session, index) => (
                                        <div
                                            key={session._id}
                                            className={`group transition-all duration-200 hover:scale-[1.02] ${currentSessionId === session._id
                                                    ? 'bg-white/15 scale-[1.02] shadow-lg shadow-white/10'
                                                    : 'hover:bg-white/5'
                                                }`}
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                                animation: isSidebarOpen ? 'fadeIn 0.3s ease-out forwards' : 'none'
                                            }}
                                        >
                                            <button
                                                onClick={() => loadChatSession(session._id)}
                                                className="w-full text-left p-3 rounded-lg transition-all duration-200"
                                                title={session.title}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Chat icon */}
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <svg className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Title */}
                                                        <div className={`font-medium text-sm leading-5 transition-all duration-200 group-hover:translate-x-1 ${currentSessionId === session._id
                                                                ? 'text-white'
                                                                : 'text-white/80 group-hover:text-white'
                                                            }`}>
                                                            {truncateTitle(session.title)}
                                                        </div>

                                                        {/* Last message preview */}
                                                        {session.lastMessage && (
                                                            <div className="text-xs text-white/50 mt-1 leading-4">
                                                                {truncateTitle(session.lastMessage, 50)}
                                                            </div>
                                                        )}

                                                        {/* Date */}
                                                        <div className="text-xs text-white/40 mt-1">
                                                            {formatDate(session.createdAt)}
                                                        </div>
                                                    </div>

                                                    {/* Active indicator */}
                                                    {currentSessionId === session._id && (
                                                        <div className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer user info */}
                        <div className="p-4 border-t border-white/10 mt-auto">
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-[#e8dcc3] flex items-center justify-center font-bold text-[#3a2c1a] text-sm transition-transform duration-200 group-hover:scale-110">
                                    T
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold">Tai Tan</div>
                                    <div className="text-xs text-white/60">Free</div>
                                </div>
                                <button className="bg-white/10 text-xs px-3 py-1 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                                    Nâng cấp
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Overlay - chỉ hiển thị trên mobile */}
            {isSidebarOpen && (
                <div
                    className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-out ${isSidebarOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        backdropFilter: 'blur(4px)',
                    }}
                />
            )}

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
