'use client';

import { useEffect, useRef } from 'react';

export interface Message {
    _id?: string;
    type: 'user' | 'ai';
    content: string;
    createdAt?: string;
}

interface Props {
    currentMessages: Message[];
    setMessage: (val: string) => void;
    loading?: boolean;
}

export default function ChatMessages({ currentMessages, setMessage, loading }: Props) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages, loading]);

    const handleSuggestionClick = (suggestion: string) => {
        setMessage(suggestion);
    };

    const FormattedContent = ({ content, type }: { content: string; type: 'user' | 'ai' }) => {
        // Xử lý content để tách đoạn đúng cách
        const processedContent = content
            // Tách các số thứ tự thành đoạn riêng (1., 2., 3.,...)
            .replace(/(\d+\.\s)/g, '\n\n$1')
            // Tách các từ khóa quan trọng
            .replace(/(Đại diện tiêu biểu:|Nội dung:|Quan điểm chính:|Kết luận:|Ví dụ:)/g, '\n$1')
            // Tách đoạn tại dấu chấm + chữ in hoa (tránh viết tắt)
            .replace(/([a-zàáảãạăắằẳẵặâấầẩẫậêếềểễệèéẻẽẹìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])\.\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ])/g, '$1.\n\n$2')
            // Loại bỏ multiple newlines
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        // Tách thành các đoạn
        const paragraphs = processedContent.split('\n\n').filter(p => p.trim());

        return (
            <div className="space-y-4">
                {paragraphs.map((paragraph, paragraphIndex) => {
                    const lines = paragraph.split('\n').filter(line => line.trim());

                    return (
                        <div key={paragraphIndex}>
                            {lines.map((line, lineIndex) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;

                                // Loại bỏ bullet points và dashes khỏi text
                                const cleanedText = trimmed.replace(/^[◦•○-]\s+/, '');

                                // Kiểm tra các pattern
                                const isNumberedTitle = /^\d+\.\s+.*:/.test(cleanedText);
                                const isNumberedItem = /^\d+\.\s+/.test(cleanedText) && !isNumberedTitle;
                                const isKeyword = /^(Đại diện tiêu biểu|Nội dung|Quan điểm chính|Kết luận|Ví dụ):/.test(cleanedText);

                                // Numbered title với dấu hai chấm
                                if (isNumberedTitle) {
                                    return (
                                        <div key={lineIndex} className="mt-6 mb-3">
                                            <h3 className="text-lg font-bold text-gray-800 leading-snug">
                                                {cleanedText}
                                            </h3>
                                        </div>
                                    );
                                }

                                // Numbered item
                                if (isNumberedItem) {
                                    return (
                                        <div key={lineIndex} className="mt-4 mb-2">
                                            <h4 className="text-base font-semibold text-gray-800 leading-snug">
                                                {cleanedText}
                                            </h4>
                                        </div>
                                    );
                                }

                                // Keywords
                                if (isKeyword) {
                                    const parts = cleanedText.split(':');
                                    const keyword = parts[0];
                                    const content = parts.slice(1).join(':').trim();

                                    return (
                                        <div key={lineIndex} className="mt-3 mb-2">
                                            <div className="font-semibold text-gray-700 mb-1">
                                                {keyword}:
                                            </div>
                                            {content && (
                                                <div className={`pl-4 leading-relaxed ${type === 'user' ? 'font-medium text-gray-900' : 'text-gray-800'
                                                    }`}>
                                                    {content}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Regular paragraph
                                return (
                                    <p
                                        key={lineIndex}
                                        className={`leading-relaxed my-2 ${type === 'user' ? 'font-medium text-gray-900' : 'text-gray-800'
                                            }`}
                                    >
                                        {cleanedText}
                                    </p>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Khi chưa có tin nhắn
    if (currentMessages.length === 0) {
        return (
            <div className="h-full p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto h-full flex flex-col justify-center text-center space-y-6">
                    <p className="text-lg text-gray-800 italic font-medium bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md border border-amber-200">
                        "Nhận thức là quá trình phản ánh thế giới khách quan trong tư duy con người." — Aristotle
                    </p>

                    <div className="space-y-3 max-w-sm mx-auto">
                        {['Những trường phái lớn về nhận thức?', 'Vai trò trong đời sống?', 'Các nhà triết học tiêu biểu?'].map(
                            (s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="w-full text-left p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shadow-md group"
                                >
                                    <span className="text-gray-800 font-medium group-hover:text-gray-900">{s}</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {currentMessages.map((msg, i) => (
                        <div key={i} className="flex items-start space-x-4">
                            {/* Avatar */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${msg.type === 'user'
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-2 ring-amber-300'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white ring-2 ring-blue-300'
                                    }`}
                            >
                                {msg.type === 'user' ? (
                                    <span className="text-lg font-bold">T</span>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Nội dung */}
                            <div className="flex-1 min-w-0">
                                <div
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 shadow-md ${msg.type === 'user'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                        }`}
                                >
                                    {msg.type === 'user' ? '🙋‍♂️ Bạn' : '🤖 Lý luận nhận thức'}
                                </div>

                                <div
                                    className={`rounded-xl p-6 shadow-lg border-2 ${msg.type === 'user'
                                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
                                        }`}
                                >
                                    <FormattedContent content={msg.content} type={msg.type} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-blue-300">
                                <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    🤖 Lý luận nhận thức
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border-2 border-blue-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1">
                                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-sm"></div>
                                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-blue-700 text-sm font-bold italic">Đang suy nghĩ...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}