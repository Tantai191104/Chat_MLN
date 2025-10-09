'use client';

import { useAuthStore } from '@/store/useAuthStore';
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
  const { user } = useAuthStore();
  const parseTextWithLinks = (text: string): React.ReactNode[] => {
    if (!text) return [];

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex for handling links with optional spaces in URLs
    const regex = /\[([^\]]+)\]\s*\(\s*([^)]+?)\s*\)|(?:^|[\s(])(https?:\/\/[^\s<>[\]()]+)(?:$|[\s)])/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Text trước link
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        // Markdown link [text](url)
        const displayText = match[1].trim();
        let url = match[2].trim();

        // Xử lý URL có khoảng trắng
        url = url.replace(/\s+/g, '');

        elements.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium break-words inline-flex items-center"
          >
            <span className="mr-1">🔗</span>
            {displayText}
          </a>
        );
      } else {
        // URL thông thường
        const url = match[3];
        const displayUrl = url.length > 50 ? `${url.slice(0, 40)}...${url.slice(-10)}` : url;

        elements.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium break-words inline-flex items-center"
          >
            <span className="mr-1">🔗</span>
            {displayUrl}
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

  function FormattedContent({ content, type, mediaUrl }: { content: string; type: string; mediaUrl?: string }) {
    // Kiểm tra nếu là placeholder hình ảnh
    const isImagePlaceholder = content === '[Hình ảnh]' && mediaUrl;

    if (isImagePlaceholder) {
      return (
        <div className="flex justify-center mb-4">
          <img
            src={mediaUrl}
            alt="Uploaded content"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>
      );
    }

    // Xử lý nội dung text
    const processContent = (text: string) => {
      if (!text || isImagePlaceholder) return [];

      const elements: React.ReactNode[] = [];

      // Tách text thành các dòng để xử lý
      const lines = text.split('\n');
      let i = 0;

      while (i < lines.length) {
        const line = lines[i].trim();

        // Bỏ qua dòng trống
        if (!line) {
          i++;
          continue;
        }

        // 1. Kiểm tra đề mục có số thứ tự có dấu hai chấm (1., 2., 3., etc.)
        const numberedTitleWithColonMatch = line.match(/^(\d+)\.\s*([^:]+):\s*(.*)$/);
        if (numberedTitleWithColonMatch) {
          const [, number, title, afterColon] = numberedTitleWithColonMatch;

          // Render tiêu đề
          elements.push(
            <div key={`title-${i}`} className="mb-6 mt-8 first:mt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                <span className="text-blue-600 mr-2">{number}.</span>
                {parseTextWithLinks(title)}:
              </h2>
            </div>
          );

          // Nếu có nội dung sau dấu hai chấm trên cùng dòng
          if (afterColon.trim()) {
            elements.push(
              <div key={`title-content-${i}`} className="mb-4 pl-4">
                <p className="text-gray-700 leading-relaxed">
                  {parseTextWithLinks(afterColon.trim())}
                </p>
              </div>
            );
          }

          i++;

          // Xử lý tất cả các dòng tiếp theo cho đến khi gặp đề mục mới
          while (i < lines.length) {
            const nextLine = lines[i].trim();

            // Nếu gặp đề mục mới thì dừng
            if (nextLine.match(/^\d+\.\s*[^:]+:/)) {
              break;
            }

            // Bỏ qua dòng trống
            if (!nextLine) {
              i++;
              continue;
            }

            // Xử lý bullet point
            if (nextLine.startsWith('•')) {
              const bulletContent = nextLine.substring(1).trim();
              elements.push(
                <div
                  key={`sub-bullet-${i}`}
                  className="pl-6 mb-2 flex items-start text-gray-700 leading-relaxed"
                >
                  <span className="text-blue-500 mr-2 mt-1 text-lg font-bold">•</span>
                  <span className="whitespace-pre-line break-words flex-1">
                    {parseTextWithLinks(bulletContent)}
                  </span>
                </div>
              );
            }

            // Xử lý link đơn lẻ
            else if (nextLine.match(/^\s*\[([^\]]+)\]\s*\(\s*([^)]+?)\s*\)\s*$/)) {
              const linkMatch = nextLine.match(/^\s*\[([^\]]+)\]\s*\(\s*([^)]+?)\s*\)\s*$/);
              if (linkMatch) {
                const [, linkText, linkUrl] = linkMatch;
                elements.push(
                  <div key={`sub-link-${i}`} className="mb-3 pl-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                      <a
                        href={linkUrl.trim().replace(/\s+/g, '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium inline-flex items-center"
                      >
                        <span className="mr-2">🔗</span>
                        {linkText.trim()}
                      </a>
                    </div>
                  </div>
                );
              }
            }
            // Xử lý hình ảnh
            else if (nextLine.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
              const imageMatch = nextLine.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
              if (imageMatch) {
                const [, altText, imageUrl] = imageMatch;
                elements.push(
                  <div key={`sub-image-${i}`} className="mb-4 pl-4 flex justify-center">
                    <img
                      src={imageUrl}
                      alt={altText || 'Image'}
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                );
              }
            }
            // Nội dung thông thường thuộc đề mục
            else {
              elements.push(
                <div key={`sub-text-${i}`} className="mb-3 pl-4">
                  <p className="text-gray-700 leading-relaxed">
                    {parseTextWithLinks(nextLine)}
                  </p>
                </div>
              );
            }

            i++;
          }

          continue;
        }

        // 2. Kiểm tra đề mục có số thứ tự không có dấu hai chấm
        const numberedTitleMatch = line.match(/^(\d+)\.\s*(.+)$/);
        if (numberedTitleMatch && !line.includes(':')) {
          const [, number, title] = numberedTitleMatch;
          elements.push(
            <div key={`title-${i}`} className="mb-6 mt-8 first:mt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                <span className="text-blue-600 mr-2">{number}.</span>
                {parseTextWithLinks(title)}
              </h2>
            </div>
          );
          i++;
          continue;
        }

        // 3. Kiểm tra bullet point với dấu •
        if (line.startsWith('•')) {
          const bulletContent = line.substring(1).trim();
          elements.push(
            <div key={`bullet-wrapper-${i}`} className="mt-8 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 mt-1 flex-shrink-0 text-base font-bold">•</span>
                <div className="text-gray-700 leading-relaxed flex-1">
                  {parseTextWithLinks(bulletContent)}
                </div>
              </div>
            </div>
          );
          i++;
          continue;
        }

        // 4. Kiểm tra tiêu đề có dấu hai chấm (không có số)
        if (line.includes(':') && !line.match(/^\d+\.\s/)) {
          const colonIndex = line.indexOf(':');
          const beforeColon = line.substring(0, colonIndex).trim();
          const afterColon = line.substring(colonIndex + 1).trim();

          const isTitle = beforeColon.length <= 80 && !beforeColon.includes('http');

          if (isTitle) {
            elements.push(
              <div key={`subtitle-${i}`} className="mb-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {parseTextWithLinks(beforeColon)}:
                </h3>
                {afterColon && (
                  <div className="pl-4 text-gray-700 leading-relaxed mb-4">
                    {parseTextWithLinks(afterColon)}
                  </div>
                )}
              </div>
            );
            i++;
            continue;
          }
        }

        // 5. Kiểm tra hình ảnh
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const [, altText, imageUrl] = imageMatch;
          elements.push(
            <div key={`image-${i}`} className="mb-4 flex justify-center">
              <img
                src={imageUrl}
                alt={altText || 'Image'}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          );
          i++;
          continue;
        }

        // 6. Kiểm tra link đơn lẻ
        const linkOnlyMatch = line.match(/^\s*\[([^\]]+)\]\s*\(\s*([^)]+?)\s*\)\s*$/);
        if (linkOnlyMatch) {
          const [, linkText, linkUrl] = linkOnlyMatch;
          elements.push(
            <div key={`link-${i}`} className="mb-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                <a
                  href={linkUrl.trim().replace(/\s+/g, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium inline-flex items-center"
                >
                  <span className="mr-2">🔗</span>
                  {linkText.trim()}
                </a>
              </div>
            </div>
          );
          i++;
          continue;
        }

        // 7. Đoạn văn thông thường
        elements.push(
          <div key={`text-${i}`} className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {parseTextWithLinks(line)}
            </p>
          </div>
        );
        i++;
      }

      return elements;
    };

    return (
      <div className="prose prose-blue max-w-none text-gray-800">
        {processContent(
          content = content
            .replace(/•\s*/g, '\n• ')
            .replace(/(\d+)\.\s*/g, '\n$1. ')
        )}
      </div>
    );
  }


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
          {currentMessages.map((msg: any, i: number) => (
            <div key={i} className="flex items-start space-x-4">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden ring-2 ${msg.type === 'user'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-amber-300'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 ring-blue-300'
                  }`}
              >
                {msg.type === 'user' ? (
                  user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || 'T'}
                    </span>
                  )
                ) : (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
                  {msg.type === 'user' ? `🙋‍♂️ ${user?.name}` : 'Quái vật lý luận nhận thức'}
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

          {/* Hiệu ứng loading của AI */}
          {loading && (
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-blue-300">
                <svg
                  className="w-5 h-5 text-white animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  Quái vật lý luận nhận thức
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-sm"></div>
                      <div
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-sm"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-sm"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-blue-700 text-sm font-bold italic">
                      Đang suy nghĩ...
                    </span>
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
