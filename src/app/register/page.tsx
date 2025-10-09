'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { register } from '@/services/authService';

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            messageApi.warning('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            const response = await register(
                formData.username,
                formData.email,
                formData.password
            );

            if (response.data.success) {
                messageApi.success({
                    content: response.data.message || 'Đăng ký thành công! Hãy đăng nhập để tiếp tục.',
                    duration: 3,
                });

                // 👉 Chuyển hướng thẳng sang trang login sau khi đăng ký thành công
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } else {
                messageApi.error({
                    content: response.data.message || 'Đăng ký thất bại',
                    duration: 3,
                });
            }
        } catch (error: any) {
            console.error('Registration error:', error);

            if (error.response?.data?.message) {
                messageApi.error({
                    content: error.response.data.message,
                    duration: 3,
                });
            } else {
                messageApi.error({
                    content: 'Đã xảy ra lỗi trong quá trình đăng ký',
                    duration: 3,
                });
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center relative bg-philo-bg">
            {contextHolder}

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')"
                }}
            ></div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Registration Form */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-amber-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 drop-shadow-sm">
                            Đăng ký tài khoản
                        </h1>
                        <p className="text-gray-600 font-medium">
                            "Hành trình nghìn dặm bắt đầu bằng một bước chân" — Lão Tử
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                                Tên người dùng
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-amber-50 border rounded-xl text-gray-900 font-semibold placeholder-gray-400 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-600 ${errors.username ? 'border-red-500' : 'border-amber-500'
                                    }`}
                                placeholder="Nhập tên người dùng"
                                disabled={loading}
                            />
                            {errors.username && (
                                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-amber-50 border rounded-xl text-gray-900 font-semibold placeholder-gray-400 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-600 ${errors.email ? 'border-red-500' : 'border-amber-500'
                                    }`}
                                placeholder="Nhập địa chỉ email"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-amber-50 border rounded-xl text-gray-900 font-semibold placeholder-gray-400 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-600 ${errors.password ? 'border-red-500' : 'border-amber-500'
                                    }`}
                                placeholder="Nhập mật khẩu"
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-amber-50 border rounded-xl text-gray-900 font-semibold placeholder-gray-400 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-600 ${errors.confirmPassword ? 'border-red-500' : 'border-amber-500'
                                    }`}
                                placeholder="Nhập lại mật khẩu"
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                Đã có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => router.push('/login')}
                                    className="text-amber-700 hover:text-amber-800 font-semibold transition-colors duration-200"
                                    disabled={loading}
                                >
                                    Đăng nhập ngay
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
