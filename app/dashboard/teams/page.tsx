'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import type { Team, Profile } from '@/lib/types';
import { Plus, Users, UserPlus, X } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', leader_id: '' });
  const [saving, setSaving] = useState(false);
  const [addMember, setAddMember] = useState<{ teamId: string; userId: string } | null>(null);

  async function load() {
    const supabase = createClient();
    const [{ data: t }, { data: u }] = await Promise.all([
      supabase.from('teams').select('*, leader:profiles(id, first_name, last_name), members:team_members(id, user_id, profile:profiles(id, first_name, last_name, role))').order('name'),
      supabase.from('profiles').select('*').eq('is_active', true).order('first_name'),
    ]);
    setTeams((t ?? []) as unknown as Team[]);
    setUsers((u ?? []) as Profile[]);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createClient().from('teams').insert({ name: form.name, leader_id: form.leader_id || null });
    setForm({ name: '', leader_id: '' });
    setShowModal(false);
    setSaving(false);
    load();
  }

  async function handleAddMember() {
    if (!addMember) return;
    await createClient().from('team_members').upsert({ team_id: addMember.teamId, user_id: addMember.userId });
    setAddMember(null);
    load();
  }

  async function removeMember(memberId: string) {
    await createClient().from('team_members').delete().eq('id', memberId);
    load();
  }

  return (
    <>
      <Topbar title="Teams" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Team</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  {team.leader && <p className="text-xs text-gray-500">Lead: {(team.leader as any).first_name} {(team.leader as any).last_name}</p>}
                </div>
              </div>
              <div className="space-y-2">
                {(team.members ?? []).map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {m.profile?.first_name?.[0]}{m.profile?.last_name?.[0]}
                    </div>
                    <span className="flex-1 text-gray-700">{m.profile?.first_name} {m.profile?.last_name}</span>
                    <button onClick={() => removeMember(m.id)} className="text-gray-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setAddMember({ teamId: team.id, userId: '' })}
                className="mt-3 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                <UserPlus className="w-3 h-3" /> Add member
              </button>
            </div>
          ))}
          {teams.length === 0 && <p className="col-span-3 text-center text-gray-400 py-8">No teams yet</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">New Team</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Team name *" className="input" />
              <select value={form.leader_id} onChange={e => setForm({ ...form, leader_id: e.target.value })} className="input">
                <option value="">Select leader (optional)</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add Member</h2>
            <select value={addMember.userId} onChange={e => setAddMember({ ...addMember, userId: e.target.value })} className="input mb-4">
              <option value="">Select staff member</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} — {u.role}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAddMember(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAddMember} disabled={!addMember.userId} className="btn-primary flex-1 justify-center">Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
