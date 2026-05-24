'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/clients', label: 'Clients', icon: '🏢' },
  { href: '/sites', label: 'Sites', icon: '📍' },
  { href: '/scheduling', label: 'Scheduling', icon: '📅' },
  { href: '/visits', label: 'Visits', icon: '📋' },
  { href: '/teams', label: 'Teams', icon: '👥' },
  { href: '/users', label: 'Staff', icon: '👤' },
  { href: '/reports', label: 'Reports', icon: '📄' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-lg">
            🐛
          </div>
          <div>
            <p className="font-bold text-white text-sm">PestControl Pro</p>
            <p className="text-slate-400 text-xs">Operations Platform</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white',
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">Built by FoxSystems Tech</p>
      </div>
    </aside>
  );
}
