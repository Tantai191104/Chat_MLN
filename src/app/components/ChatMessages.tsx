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

    // FIXED: Hàm để parse text và highlight links
    const parseTextWithLinks = (text: string) => {
        // Tìm tất cả các patterns link
        type LinkPattern =
            | {
                regex: RegExp;
                replacer: (match: string, linkText: string, url: string, index: string) => JSX.Element;
            }
            | {
                regex: RegExp;
                replacer: (match: string, url: string, index: string) => JSX.Element;
            };

        const linkPatterns: LinkPattern[] = [
            // Pattern 1: [text](url)
            {
                regex: /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
                replacer: (match: string, linkText: string, url: string, index: string) => (
                    <a
                        key={`markdown-${index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 mx-1 text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 font-medium text-sm"
                        style={{
                            textDecoration: 'none',
                            boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
                        }}
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {linkText}
                    </a>
                )
            },
            // Pattern 2: Plain URLs - Cải thiện regex để xử lý tốt hơn
            {
                regex: /(https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?-]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?-]|%[0-9A-Fa-f]{2})*)?)/g,
                replacer: (match: string, url: string, index: string) => (
                    <a
                        key={`url-${index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 mx-1 text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 font-medium text-sm"
                        style={{
                            textDecoration: 'none',
                            boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
                        }}
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {url.length > 40 ? url.substring(0, 40) + '...' : url}
                    </a>
                )
            }
        ];

        let result = text;
        let components: Array<{ start: number; end: number; component: JSX.Element }> = [];

        // Xử lý từng pattern
        linkPatterns.forEach((pattern, patternIndex) => {
            const matches = Array.from(text.matchAll(pattern.regex));

            matches.forEach((match, matchIndex) => {
                if (match.index !== undefined) {
                    const start = match.index;
                    const end = match.index + match[0].length;

                    // Kiểm tra không bị overlap với components khác
                    const hasOverlap = components.some(comp =>
                        (start >= comp.start && start < comp.end) ||
                        (end > comp.start && end <= comp.end) ||
                        (start <= comp.start && end >= comp.end)
                    );

                    if (!hasOverlap) {
                        let component;
                        if (pattern.regex.source.includes('\\[')) {
                            // Markdown link
                            component = pattern.replacer(match[0], match[1], match[2], `${patternIndex}-${matchIndex}`);
                        } else {
                            // Plain URL
                            component = pattern.replacer(match[0], match[1], '', `${patternIndex}-${matchIndex}`);
                        }

                        components.push({
                            start,
                            end,
                            component
                        });
                    }
                }
            });
        });

        // Sắp xếp components theo vị trí
        components.sort((a, b) => a.start - b.start);

        // Tạo final result với components
        if (components.length === 0) {
            return text;
        }

        const finalResult: React.ReactNode[] = [];
        let lastIndex = 0;

        components.forEach((comp) => {
            // Thêm text trước component
            if (comp.start > lastIndex) {
                finalResult.push(text.substring(lastIndex, comp.start));
            }

            // Thêm component
            finalResult.push(comp.component);

            lastIndex = comp.end;
        });

        // Thêm text cuối
        if (lastIndex < text.length) {
            finalResult.push(text.substring(lastIndex));
        }

        return finalResult;
    };

    const FormattedContent = ({ content, type, mediaUrl }: { content: string; type: 'user' | 'ai'; mediaUrl?: string }) => {
        console.log('FormattedContent props:', { content, mediaUrl });

        let processedContent = '';
        let paragraphs: string[] = [];

        const isImagePlaceholder = content === "[Hình ảnh gửi lên]" || content === "Hình ảnh gửi lên";

        if (content && !isImagePlaceholder) {
            processedContent = content
                .replace(/(\d+\.\s)/g, '\n\n$1')
                .replace(/(Đại diện tiêu biểu:|Nội dung:|Quan điểm chính:|Kết luận:|Ví dụ:)/g, '\n$1')
                .replace(/([a-zàáảãạăắằẳẵặâấầ̉ẫậêếềểễệèéẻẽẹìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])\.\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ])/g, '$1.\n\n$2')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            paragraphs = processedContent.split('\n\n').filter(p => p.trim());
        }

        return (
            <div className="space-y-4">
                {/* Hiển thị ảnh nếu có mediaUrl */}
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
                            onLoad={() => {
                                console.log('Image loaded successfully:', mediaUrl);
                            }}
                        />
                    </div>
                )}

                {/* Hiển thị content text nếu có và không phải placeholder */}
                {content && !isImagePlaceholder && paragraphs.length > 0 && (
                    <div>
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
                                                        {parseTextWithLinks(cleanedText)}
                                                    </h3>
                                                </div>
                                            );
                                        }

                                        // Numbered item
                                        if (isNumberedItem) {
                                            return (
                                                <div key={lineIndex} className="mt-4 mb-2">
                                                    <h4 className="text-base font-semibold text-gray-800 leading-snug">
                                                        {parseTextWithLinks(cleanedText)}
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
                                                        <div className={`pl-4 leading-relaxed ${type === 'user' ? 'font-medium text-gray-900' : 'text-gray-800'}`}>
                                                            {parseTextWithLinks(content)}
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
                                                {parseTextWithLinks(cleanedText)}
                                            </p>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Trường hợp chỉ có ảnh hoặc có ảnh với placeholder text */}
                {mediaUrl && (isImagePlaceholder || !content) && (
                    <p className="text-gray-500 italic text-sm mt-2">
                        📸 Hình ảnh
                    </p>
                )}

                {/* Trường hợp có placeholder text nhưng không có ảnh */}
                {isImagePlaceholder && !mediaUrl && (
                    <p className="text-gray-500 italic">
                        {content}
                    </p>
                )}

                {/* Trường hợp chỉ có text đơn giản với links */}
                {content && !isImagePlaceholder && paragraphs.length === 0 && (
                    <p className={`leading-relaxed ${type === 'user' ? 'font-medium text-gray-900' : 'text-gray-800'}`}>
                        {parseTextWithLinks(content)}
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
                <div className="max-w-4xl mx-auto space-y-8">
                    {currentMessages.map((msg, i) => {
                        console.log('Message:', msg);

                        return (
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
                                        <FormattedContent
                                            content={msg.content}
                                            type={msg.type}
                                            mediaUrl={msg.mediaUrl}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

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