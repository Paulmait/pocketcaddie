'use client';

import { usePathname } from 'next/navigation';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AdminUser } from '@/types';

interface HeaderProps {
  user: AdminUser;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/users') return 'Users';
    if (pathname.startsWith('/users/')) return 'User Details';
    if (pathname === '/audit') return 'Audit Log';
    return 'Admin Portal';
  };

  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-white">{getPageTitle()}</h2>

      <div className="flex items-center gap-4">
        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {user.hasMfa ? (
            <div className="flex items-center gap-1.5 text-accent-green text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>MFA Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-accent-amber text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>MFA Required</span>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
        </button>
      </div>
    </header>
  );
}
