'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import type { Profile } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/utils';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data as Profile);
        setForm({ first_name: data.first_name, last_name: data.last_name, phone: data.phone ?? '' });
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('profiles').update(form).eq('id', session.user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-6 max-w-lg space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">My Profile</h2>
          {profile && (
            <p className="text-sm text-gray-500 mb-4">Role: <span className="font-medium text-gray-700">{ROLE_LABELS[profile.role]}</span></p>
          )}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">First name</label>
                <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Last name</label>
                <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" />
            </div>
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
