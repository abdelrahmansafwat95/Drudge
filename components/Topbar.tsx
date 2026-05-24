'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/utils';

interface TopbarProps { title: string; }

export default function Topbar({ title }: TopbarProps) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile(data);
    });
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {profile && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{profile.first_name} {profile.last_name}</p>
            <p className="text-xs text-gray-500">{ROLE_LABELS[profile.role]}</p>
          </div>
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
        </div>
      )}
    </header>
  );
}
