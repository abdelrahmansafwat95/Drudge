'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, MapPin, Calendar,
  Beaker, FileText, Settings, LogOut, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/dashboard/clients',    label: 'Clients',     icon: Building2 },
  { href: '/dashboard/sites',      label: 'Sites',       icon: MapPin },
  { href: '/dashboard/scheduling', label: 'Scheduling',  icon: Calendar },
  { href: '/dashboard/teams',      label: 'Teams',       icon: Users },
  { href: '/dashboard/users',      label: 'Staff',       icon: Users },
  { href: '/dashboard/chemicals',  label: 'Chemicals',   icon: Beaker },
  { href: '/dashboard/reports',    label: 'Reports',     icon: FileText },
  { href: '/dashboard/settings',   label: 'Settings',    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">PestControl</p>
            <p className="text-xs text-gray-400">Pro CRM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-primary-600' : 'text-gray-400')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
