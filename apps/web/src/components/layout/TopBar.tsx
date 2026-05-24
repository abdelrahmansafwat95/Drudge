'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/utils';

export default function TopBar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    router.replace('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
        </div>
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary text-sm">
          Sign out
        </button>
      </div>
    </header>
  );
}
