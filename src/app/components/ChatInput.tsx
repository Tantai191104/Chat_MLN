'use client';

import { useRef, useEffect } from 'react';

interface Props {
    message: string;
    setMessage: (val: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
}

export default function ChatInput({ message, setMessage, handleSubmit, loading }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim() && !loading) {
                handleSubmit(e as any);
            }
        }
    };

    // Reset textarea height when message is cleared
    useEffect(() => {
        if (!message && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [message]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = Math.min(target.scrollHeight, 128) + 'px';
    };

    return (
        <div className="w-full px-6 py-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex items-end gap-3 bg-white border border-amber-300 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-shadow">
                    {/* Heart icon */}
                    <button
                        type="button"
                        className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors p-1 mb-1"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </button>

                    {/* Textarea input */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        placeholder="What's in your mind..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base resize-none min-h-[24px] max-h-32 overflow-y-auto font-semibold"
                        rows={1}
                        disabled={loading}
                        style={{
                            lineHeight: '1.5',
                            fontFamily: 'inherit'
                        }}
                    />

                    {/* Send button */}
                    <button
                        type="submit"
                        className={`flex-shrink-0 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-full p-2 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            loading ? 'animate-pulse' : ''
                        }`}
                        disabled={!message.trim() || loading}
                    >
                        {loading ? (
                            <svg
                                className="w-5 h-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
