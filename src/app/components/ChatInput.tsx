'use client';

import { useRef, useEffect, useState } from 'react';
import { sendImgMessage } from '@/services/chatService';

interface Props {
    message: string;
    setMessage: (val: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
    chatId?: string; // Thêm chatId để gọi API upload
    onImageUploaded?: () => void; // Callback khi upload thành công
}

export default function ChatInput({ message, setMessage, handleSubmit, loading, chatId, onImageUploaded }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if ((message.trim() || selectedImage) && !loading && !uploading) {
                handleFormSubmit(e as any);
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

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh!');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');
            return;
        }

        setSelectedImage(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!message.trim() && !selectedImage) || loading || uploading) return;

        // Nếu có ảnh, upload ảnh
        if (selectedImage && chatId) {
            setUploading(true);
            try {
                await sendImgMessage(chatId, selectedImage as any, message.trim() || '');

                // Clear form
                setMessage('');
                setSelectedImage(null);
                setImagePreview(null);

                // Callback to refresh messages
                if (onImageUploaded) {
                    onImageUploaded();
                }
            } catch (error: any) {
                console.error('Upload image error:', error);
                alert(error.response?.data?.message || 'Lỗi khi gửi tin nhắn!');
            } finally {
                setUploading(false);
            }
        } else if (message.trim()) {
            // Nếu chỉ có text, gọi handleSubmit bình thường
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full px-6 py-4">
            <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
                <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="bg-white border border-amber-300 rounded-xl p-3 shadow-md">
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                        disabled={uploading}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {selectedImage?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1">
                                        📸 Sẵn sàng gửi cùng tin nhắn
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="flex items-end gap-3 bg-white border border-amber-300 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-shadow">
                        {/* Image upload button */}
                        <button
                            type="button"
                            onClick={handleImageClick}
                            className={`flex-shrink-0 text-gray-500 hover:text-blue-600 transition-colors p-1 mb-1 ${uploading || loading ? 'opacity-50 cursor-not-allowed' : ''
                                } ${selectedImage ? 'text-blue-600' : ''}`}
                            disabled={uploading || loading}
                            title="Chọn hình ảnh"
                        >
                            {uploading ? (
                                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        {/* Textarea input */}
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={handleInput}
                            placeholder={selectedImage ? "Thêm mô tả cho hình ảnh..." : "What's in your mind..."}
                            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base resize-none min-h-[24px] max-h-32 overflow-y-auto font-semibold"
                            rows={1}
                            disabled={loading || uploading}
                            style={{
                                lineHeight: '1.5',
                                fontFamily: 'inherit'
                            }}
                        />

                        {/* Send button */}
                        <button
                            type="submit"
                            className={`flex-shrink-0 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-full p-2 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${(loading || uploading) ? 'animate-pulse' : ''
                                }`}
                            disabled={(!message.trim() && !selectedImage) || loading || uploading}
                        >
                            {(loading || uploading) ? (
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

                    {/* Helper text */}
                    {selectedImage && (
                        <p className="text-xs text-gray-500 text-center">
                            💡 Nhấn Enter hoặc nút gửi để gửi hình ảnh {message.trim() ? 'cùng tin nhắn' : ''}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
