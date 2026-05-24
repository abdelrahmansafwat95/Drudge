'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import type { Profile, Role } from '@/lib/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/utils';
import { UserPlus } from 'lucide-react';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'TEAM_LEADER', 'AGENT'];

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'AGENT' as Role, phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await createClient().from('profiles').select('*').order('first_name');
    setUsers((data ?? []) as Profile[]);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { first_name: form.first_name, last_name: form.last_name, role: form.role },
      },
    });
    if (authError) { setError(authError.message); setSaving(false); return; }
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        phone: form.phone || null,
      });
    }
    setForm({ email: '', password: '', first_name: '', last_name: '', role: 'AGENT', phone: '' });
    setShowModal(false);
    setSaving(false);
    load();
  }

  async function toggleActive(user: Profile) {
    await createClient().from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
    load();
  }

  return (
    <>
      <Topbar title="Staff" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setShowModal(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add Staff</button>
        </div>

        <div className="card divide-y divide-gray-100">
          {users.map(u => (
            <div key={u.id} className="flex items-center px-5 py-4">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm mr-4">
                {u.first_name[0]}{u.last_name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                {u.phone && <p className="text-sm text-gray-500">{u.phone}</p>}
              </div>
              <span className={`badge mr-3 ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
              <button onClick={() => toggleActive(u)}
                className={`badge cursor-pointer ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {u.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
          {users.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No staff yet</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add Staff Member</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="First name *" className="input" />
                <input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Last name *" className="input" />
              </div>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" className="input" />
              <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password *" className="input" minLength={6} />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input" />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} className="input">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
