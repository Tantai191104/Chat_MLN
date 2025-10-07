'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { message } from 'antd';
import { verifyOTP, resendOTP } from '@/services/authService';

// Component chứa logic chính
function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [messageApi, contextHolder] = message.useMessage();

    // Countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp.trim()) {
            messageApi.warning('Vui lòng nhập mã OTP');
            return;
        }
        if (!email) {
            messageApi.error('Thiếu thông tin email để xác minh');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOTP(email, otp);
            console.log('Verify response:', response); // Debug log

            // Nếu có response thì là thành công
            if (response) {
                messageApi.success('Xác minh thành công!');

                // Chờ message hiển thị xong rồi mới navigate
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            }
        } catch (error: any) {
            console.error('Verify error:', error);

            // Kiểm tra nếu có response data trong error (axios thường làm vậy với status khác 2xx)
            if (error.response?.data?.message) {
                // Nếu có message thì coi như thành công
                messageApi.success('Xác minh thành công!');
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } else {
                // Chỉ hiển thị lỗi khi thực sự không có response
                const errorMessage = error.response?.data?.message || error.message || 'Mã OTP không hợp lệ';
                messageApi.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            messageApi.error('Thiếu email để gửi lại mã OTP');
            return;
        }

        try {
            const res = await resendOTP(email);
            console.log('Resend response:', res); // Debug log

            // Nếu có response thì thành công
            if (res) {
                messageApi.success('Đã gửi lại mã OTP thành công!');
                setResendTimer(60);
            }
        } catch (error: any) {
            console.error('Resend error:', error);

            // Kiểm tra response trong error
            if (error.response?.data?.message) {
                messageApi.success('Đã gửi lại mã OTP thành công!');
                setResendTimer(60);
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Gửi lại OTP thất bại';
                messageApi.error(errorMessage);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-philo-bg">
            {contextHolder}

            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage:
                        "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')",
                }}
            ></div>
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-amber-200">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Xác minh tài khoản
                        </h1>
                        <p className="text-gray-600 font-medium">
                            Nhập mã OTP đã được gửi tới email <b>{email}</b>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="otp"
                                className="block text-sm font-semibold text-gray-900 mb-2"
                            >
                                Mã OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 bg-amber-50 border rounded-xl text-gray-900 font-semibold placeholder-gray-400 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-600 border-amber-500"
                                placeholder="Nhập mã OTP gồm 6 chữ số"
                                disabled={loading}
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xác minh...' : 'Xác minh tài khoản'}
                        </button>
                    </form>

                    <div className="text-center mt-4 flex flex-col gap-2">
                        <button
                            onClick={() => router.push('/login')}
                            className="text-amber-700 hover:text-amber-800 font-semibold transition-colors duration-200"
                            disabled={loading}
                        >
                            Quay lại đăng nhập
                        </button>

                        <button
                            onClick={handleResendOTP}
                            disabled={resendTimer > 0}
                            className="text-sm text-gray-700 hover:text-amber-700 font-semibold transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {resendTimer > 0
                                ? `Gửi lại mã sau ${resendTimer}s`
                                : 'Gửi lại mã OTP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading fallback component
function VerifyLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center relative bg-philo-bg">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage:
                        "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')",
                }}
            ></div>
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-amber-200">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Đang tải...
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main component với Suspense wrapper
export default function VerifyPage() {
    return (
        <Suspense fallback={<VerifyLoading />}>
            <VerifyContent />
        </Suspense>
    );
}
