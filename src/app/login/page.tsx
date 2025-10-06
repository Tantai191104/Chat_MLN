import { Suspense } from 'react';
import LoginPage from './LoginPage';

export default function LoginWrapper() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Đang tải trang...</div>}>
      <LoginPage />
    </Suspense>
  );
}
