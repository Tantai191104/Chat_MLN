'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/app/chat/page';

interface Props {
    currentMessages: Message[];
    setMessage: (val: string) => void;
}

export default function ChatMessages({ currentMessages, setMessage }: Props) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // auto scroll xuống cuối khi có tin mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentMessages]);

    const handleSuggestionClick = (suggestion: string) => {
        setMessage(suggestion);
    };

    return (
        <div className="flex-1 flex flex-col justify-center px-6 py-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                {currentMessages.length === 0 ? (
                    <div className="text-center text-philo-title italic">
                        <p className="mb-6 text-philo-title font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg inline-block philo-shadow">"Triết học bắt đầu từ sự kinh ngạc." — Aristotle</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() =>
                                    handleSuggestionClick(
                                        'Những trường phái lớn về nhận thức trong triết học?'
                                    )
                                }
                                className="bg-philo-header border-philo-border border-2 rounded-lg p-4 text-left hover:bg-philo-hover transition-all duration-200 text-philo-title font-medium philo-shadow hover:scale-105"
                            >
                                Những trường phái lớn về nhận thức?
                            </button>
                            <button
                                onClick={() =>
                                    handleSuggestionClick(
                                        'Vai trò của lý luận nhận thức trong đời sống?'
                                    )
                                }
                                className="bg-philo-header border-philo-border border-2 rounded-lg p-4 text-left hover:bg-philo-hover transition-all duration-200 text-philo-title font-medium philo-shadow hover:scale-105"
                            >
                                Vai trò trong đời sống?
                            </button>
                            <button
                                onClick={() =>
                                    handleSuggestionClick(
                                        'Các nhà triết học tiêu biểu về nhận thức?'
                                    )
                                }
                                className="bg-philo-header border-philo-border border-2 rounded-lg p-4 text-left hover:bg-philo-hover transition-all duration-200 text-philo-title font-medium philo-shadow hover:scale-105"
                            >
                                Các nhà triết học tiêu biểu?
                            </button>
                        </div>
                    </div>
                ) : (
                    currentMessages.map((msg, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {msg.type === 'user' ? (
                                    <div className="w-8 h-8 rounded-full bg-philo-header flex items-center justify-center border-philo-border border-2 philo-shadow">
                                        <span className="text-sm font-bold text-philo-title">T</span>
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-philo-ai text-philo-white flex items-center justify-center philo-shadow">
                                        <svg className="w-5 h-5 text-philo-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L13.09 8.26L18 7.27L14.18 12L18 16.73L13.09 15.74L12 22L10.91 15.74L6 16.73L9.82 12L6 7.27L10.91 8.26L12 2Z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Message content */}
                            <div className="flex-1 max-w-3xl">
                                <div className="text-xs text-philo-title/70 mb-1 font-medium">
                                    {msg.type === 'user' ? 'Bạn' : 'Lý luận nhận thức'}
                                </div>
                                <div
                                    className={`px-4 py-3 rounded-xl whitespace-pre-wrap break-words philo-shadow ${msg.type === 'user'
                                        ? 'bg-philo-header text-philo-title border-philo-border border-2 font-medium'
                                        : 'bg-philo-white text-philo-title border-philo-border border-2 italic'
                                        }`}
                                >
                                    <p className="text-base leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
