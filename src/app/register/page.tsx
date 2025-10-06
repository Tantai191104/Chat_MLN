'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { message } from 'antd';
import 'antd/dist/reset.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Tên người dùng là bắt buộc';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            messageApi.warning({
                content: 'Vui lòng kiểm tra lại thông tin đăng ký!',
                duration: 3,
            });
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            messageApi.success({
                content: 'Đăng ký thành công! Đang chuyển hướng...',
                duration: 2,
            });

            // Simple registration logic - in real app you would call backend API
            console.log('Registration data:', formData);

            // Redirect to login page after successful registration
            setTimeout(() => {
                router.push('/?registered=true');
            }, 1000);

        } catch (error) {
            messageApi.error({
                content: 'Có lỗi xảy ra! Vui lòng thử lại.',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <div
                className="min-h-screen flex items-center justify-center bg-philo-bg relative"
                style={{
                    backgroundImage: "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Register Container */}
                <div className="relative z-10 w-full max-w-md p-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                        {/* Logo/Icon */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">Đăng ký tài khoản</h1>
                            <p className="text-gray-700 italic text-sm font-medium">
                                "Khởi đầu hành trình tri thức của bạn"
                            </p>
                        </div>

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Tên người dùng *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all bg-amber-50 text-gray-900 placeholder-gray-400 shadow-md font-semibold ${errors.username ? 'border-red-400 focus:border-red-500' : 'border-amber-500 focus:border-amber-600'
                                        }`}
                                    placeholder="Nhập tên người dùng"
                                />
                                {errors.username && <p className="text-red-500 text-xs mt-1 font-medium">{errors.username}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all bg-amber-50 text-gray-900 placeholder-gray-400 shadow-md font-semibold ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-amber-500 focus:border-amber-600'
                                        }`}
                                    placeholder="Nhập địa chỉ email"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Mật khẩu *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all bg-amber-50 text-gray-900 placeholder-gray-400 shadow-md font-semibold ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-amber-500 focus:border-amber-600'
                                        }`}
                                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Xác nhận mật khẩu *
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all bg-amber-50 text-gray-900 placeholder-gray-400 shadow-md font-semibold ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-amber-500 focus:border-amber-600'
                                        }`}
                                    placeholder="Nhập lại mật khẩu"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${loading ? 'animate-pulse' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang đăng ký...
                                    </div>
                                ) : (
                                    'Đăng ký'
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{' '}
                                <Link
                                    href="/"
                                    className="text-amber-700 hover:text-amber-800 transition-colors font-medium hover:underline"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>

                        {/* Quote */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-600 italic font-medium">
                                "Học hỏi là kho báu sẽ theo chủ nhân ở khắp nơi." — Tục ngữ Trung Hoa
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
