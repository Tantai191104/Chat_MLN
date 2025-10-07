'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { message } from 'antd';
import { login } from '@/services/authService';
import 'antd/dist/reset.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const registered = searchParams?.get('registered');
    if (registered === 'true' && !hasShownToast.current) {
      hasShownToast.current = true;
      messageApi.success({
        content: 'Đăng ký thành công! Kiểm tra email để lấy OTP và đăng nhập.',
        duration: 5,
        style: { marginTop: '20vh' },
      });

      // Xóa query param khỏi URL
      const url = new URL(window.location.href);
      url.searchParams.delete('registered');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, messageApi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      messageApi.warning({
        content: 'Vui lòng điền đầy đủ thông tin!',
        duration: 3,
      });
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      messageApi.warning({
        content: 'Email không hợp lệ!',
        duration: 3,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login response:', response);

      // ✅ Backend trả về { message, data }
      const userData = response?.data || response?.data?.data;

      if (userData?.token) {
        messageApi.success({
          content: 'Đăng nhập thành công! Chuyển hướng...',
          duration: 2,
        });

        setTimeout(() => {
          router.push('/chat');
        }, 1000);
      } else {
        messageApi.error({
          content: response?.message || 'Đăng nhập thất bại',
          duration: 3,
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMsg =
        error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi trong quá trình đăng nhập';

      messageApi.error({
        content: errorMsg,
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
          backgroundImage:
            "url('https://cdn.vietnambiz.vn/2019/9/23/mind-1-e1566168915788-1569231581988672857339.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-md p-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 philo-shadow">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">
                Lý luận nhận thức
              </h1>
              <p className="text-gray-700 italic text-sm font-medium">
                "Triết học là nghệ thuật đặt câu hỏi và lý giải nhận thức"
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-500 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition-all text-gray-900 placeholder-gray-400 shadow-md font-semibold"
                  placeholder="Nhập địa chỉ email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-500 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition-all text-gray-900 placeholder-gray-400 shadow-md font-semibold"
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${loading ? 'animate-pulse' : ''
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                        5.291A7.962 7.962 0 014 12H0c0 
                        3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-3">
              <a
                href="#"
                className="block text-sm text-amber-700 hover:text-amber-800 transition-colors font-medium hover:underline"
              >
                Quên mật khẩu?
              </a>
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  href="/register"
                  className="text-amber-700 hover:text-amber-800 transition-colors font-medium hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Quote */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-600 italic font-medium">
                "Tôi biết rằng tôi không biết gì." — Socrates
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
