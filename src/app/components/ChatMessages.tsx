'use client';

import { JSX, useEffect, useRef } from 'react';

export interface Message {
    _id?: string;
    type: 'user' | 'ai';
    content: string;
    mediaUrl?: string;
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

    const parseTextWithLinks = (text: string): React.ReactNode[] => {
        if (!text) return [];

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        // Regex tổng hợp: markdown link + plain URL (cải thiện)
        const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>\[\]()]+)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Text trước link
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }

            if (match[1] && match[2]) {
                // Markdown link [text](url)
                elements.push(
                    <a
                        key={match.index}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium break-words"
                    >
                        {match[1]}
                    </a>
                );
            } else if (match[3]) {
                // Plain URL
                const url = match[3];
                elements.push(
                    <a
                        key={match.index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium break-words"
                    >
                        {url.length > 50 ? url.slice(0, 50) + '...' : url}
                    </a>
                );
            }

            lastIndex = regex.lastIndex;
        }

        // Text còn lại
        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return elements;
    };

    const FormattedContent = ({ content, type, mediaUrl }: { content: string; type: 'user' | 'ai'; mediaUrl?: string }) => {
        const isImagePlaceholder = content === "[Hình ảnh gửi lên]" || content === "Hình ảnh gửi lên";

        if (!content && !mediaUrl) return null;

        // Xử lý nội dung text
        const processContent = (text: string) => {
            if (!text || isImagePlaceholder) return [];

            // Tách các dòng và xử lý
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            const elements: React.ReactNode[] = [];
            let currentIndex = 0;

            while (currentIndex < lines.length) {
                const line = lines[currentIndex];

                // 1. Tiêu đề chính có số thứ tự (1., 2., 3.)
                const mainTitleMatch = line.match(/^(\d+)\.\s*(.+)$/);
                if (mainTitleMatch) {
                    const [, number, title] = mainTitleMatch;
                    elements.push(
                        <div key={currentIndex} className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                                <span className="text-blue-600">{number}.</span> {parseTextWithLinks(title)}
                            </h2>
                        </div>
                    );
                    currentIndex++;
                    continue;
                }

                // 2. Kiểm tra dòng chỉ chứa link (có hoặc không có markdown)
                const linkOnlyMatch = line.match(/^(.*?)(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>\[\]()]+))(.*)$/);
                if (linkOnlyMatch) {
                    const beforeLink = linkOnlyMatch[1]?.trim();
                    const linkText = linkOnlyMatch[3];
                    const linkUrl = linkOnlyMatch[4] || linkOnlyMatch[5];
                    const afterLink = linkOnlyMatch[6]?.trim();

                    // Nếu dòng chỉ chứa link (có thể có text ít ở đầu hoặc cuối)
                    if ((!beforeLink || beforeLink.length < 10) && (!afterLink || afterLink.length < 10)) {
                        elements.push(
                            <div key={currentIndex} className="mb-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-blue-600 text-sm">🔗</span>
                                    <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline font-medium break-words text-sm"
                                    >
                                        {linkText || (linkUrl.length > 60 ? linkUrl.slice(0, 60) + '...' : linkUrl)}
                                    </a>
                                </div>
                            </div>
                        );
                        currentIndex++;
                        continue;
                    }
                }

                // 3. Mô tả/nội dung chính (không bắt đầu bằng bullet hoặc số)
                if (!line.match(/^[•◦○-]\s+/) && !line.match(/^\d+\.\s/) && line.includes(':')) {
                    const colonIndex = line.indexOf(':');
                    const beforeColon = line.substring(0, colonIndex);
                    const afterColon = line.substring(colonIndex + 1).trim();

                    elements.push(
                        <div key={currentIndex} className="mb-4">
                            <div className="font-semibold text-gray-800 mb-2">
                                {parseTextWithLinks(beforeColon)}:
                            </div>
                            {afterColon && (
                                <div className="pl-4 text-gray-700 leading-relaxed">
                                    {parseTextWithLinks(afterColon)}
                                </div>
                            )}
                        </div>
                    );
                    currentIndex++;
                    continue;
                }

                // 4. Bullet points
                if (line.match(/^[•◦○-]\s+/)) {
                    const cleanText = line.replace(/^[•◦○-]\s+/, '');

                    // Kiểm tra nếu bullet point chứa link
                    const bulletLinkMatch = cleanText.match(/^(.*?)(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\|(https?:\/\/[^\s<>\[\]()]+))(.*)$/);
                    if (bulletLinkMatch && (!bulletLinkMatch[1]?.trim() || bulletLinkMatch[1].trim().length < 15)) {
                        const linkText = bulletLinkMatch[3];
                        const linkUrl = bulletLinkMatch[4] || bulletLinkMatch[5];

                        elements.push(
                            <div key={currentIndex} className="mb-2 flex items-start">
                                <span className="text-blue-600 mr-3 mt-1 text-sm">•</span>
                                <div className="flex items-center space-x-2 flex-1">
                                    <span className="text-blue-600 text-sm">🔗</span>
                                    <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline font-medium break-words text-sm"
                                    >
                                        {linkText || (linkUrl.length > 60 ? linkUrl.slice(0, 60) + '...' : linkUrl)}
                                    </a>
                                </div>
                            </div>
                        );
                    } else {
                        elements.push(
                            <div key={currentIndex} className="mb-2 flex items-start">
                                <span className="text-blue-600 mr-3 mt-1 text-sm">•</span>
                                <div className="text-gray-800 leading-relaxed flex-1">
                                    {parseTextWithLinks(cleanText)}
                                </div>
                            </div>
                        );
                    }
                    currentIndex++;
                    continue;
                }

                // 5. Đoạn văn thông thường
                elements.push(
                    <p key={currentIndex} className="mb-4 text-gray-800 leading-relaxed">
                        {parseTextWithLinks(line)}
                    </p>
                );
                currentIndex++;
            }

            return elements;
        };

        const contentElements = processContent(content);

        return (
            <div className="space-y-1">
                {/* Hiển thị ảnh */}
                {mediaUrl && (
                    <div className="mb-4">
                        <img
                            src={mediaUrl}
                            alt="Uploaded image"
                            className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                            style={{ maxHeight: '400px', maxWidth: '100%' }}
                            onClick={() => window.open(mediaUrl, '_blank')}
                            onError={(e) => {
                                console.error('Image load error:', e);
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Hiển thị nội dung text */}
                {contentElements.length > 0 && (
                    <div className="space-y-1">
                        {contentElements}
                    </div>
                )}

                {/* Trường hợp đặc biệt */}
                {mediaUrl && (isImagePlaceholder || !content) && (
                    <p className="text-gray-500 italic text-sm">
                        📸 Hình ảnh
                    </p>
                )}

                {isImagePlaceholder && !mediaUrl && (
                    <p className="text-gray-500 italic">
                        {content}
                    </p>
                )}
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
                <div className="max-w-4xl mx-auto space-y-6">
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
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 shadow-md ${msg.type === 'user'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                        }`}
                                >
                                    {msg.type === 'user' ? '🙋‍♂️ Bạn' : '🤖 Lý luận nhận thức'}
                                </div>

                                <div
                                    className={`rounded-xl p-5 shadow-lg border ${msg.type === 'user'
                                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                                        }`}
                                >
                                    <FormattedContent
                                        content={msg.content}
                                        type={msg.type}
                                        mediaUrl={msg.mediaUrl}
                                    />
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
                                <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    🤖 Lý luận nhận thức
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-lg border border-blue-200">
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