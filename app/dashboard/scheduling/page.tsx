'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import type { Visit, Site, Team, VisitStatus } from '@/lib/types';
import { formatDateTime, STATUS_COLORS } from '@/lib/utils';
import { Plus, Filter } from 'lucide-react';

const STATUSES: VisitStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function SchedulingPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ site_id: '', team_id: '', scheduled_at: '', notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    let q = supabase.from('visits').select('*, site:sites(name, client:clients(name)), team:teams(name)').order('scheduled_at', { ascending: false });
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    setVisits((data ?? []) as unknown as Visit[]);
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    supabase.from('sites').select('id, name, client:clients(name)').eq('is_active', true).order('name').then(({ data }) => setSites((data ?? []) as any));
    supabase.from('teams').select('id, name').eq('is_active', true).order('name').then(({ data }) => setTeams((data ?? []) as any));
  }, [statusFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createClient().from('visits').insert(form);
    setForm({ site_id: '', team_id: '', scheduled_at: '', notes: '' });
    setShowModal(false);
    setSaving(false);
    load();
  }

  async function updateStatus(id: string, status: VisitStatus) {
    const supabase = createClient();
    const data: any = { status };
    if (status === 'IN_PROGRESS') data.started_at = new Date().toISOString();
    if (status === 'COMPLETED') data.completed_at = new Date().toISOString();
    await supabase.from('visits').update(data).eq('id', id);
    load();
  }

  return (
    <>
      <Topbar title="Scheduling" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary ml-auto"><Plus className="w-4 h-4" /> Schedule Visit</button>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Site / Client</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Team</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Scheduled</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {visits.map(v => (
                <tr key={v.id} className="table-row">
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/visits/${v.id}`} className="font-medium text-gray-900 hover:text-primary-600">{(v.site as any)?.name}</Link>
                    <p className="text-xs text-gray-500">{(v.site as any)?.client?.name}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{(v.team as any)?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDateTime(v.scheduled_at)}</td>
                  <td className="px-5 py-3"><span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status}</span></td>
                  <td className="px-5 py-3">
                    <select value={v.status} onChange={e => updateStatus(v.id, e.target.value as VisitStatus)} className="input w-36 text-xs py-1">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No visits found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Schedule Visit</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <select required value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value })} className="input">
                <option value="">Select site *</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name} — {(s as any).client?.name}</option>)}
              </select>
              <select required value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value })} className="input">
                <option value="">Select team *</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} className="input" />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="input h-20 resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving…' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
