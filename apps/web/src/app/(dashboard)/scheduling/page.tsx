'use client';
import { useEffect, useState } from 'react';
import { schedulingApi, sitesApi, teamsApi } from '@/lib/api';
import { formatDate, STATUS_COLORS } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

export default function SchedulingPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ siteId: '', teamId: '', scheduledAt: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      schedulingApi.getVisits(filter !== 'ALL' ? { status: filter } : undefined),
      sitesApi.getAll(),
      teamsApi.getAll(),
    ]).then(([v, s, t]) => {
      setVisits(v.data);
      setSites(s.data);
      setTeams(t.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await schedulingApi.createVisit(form);
      setShowModal(false);
      setForm({ siteId: '', teamId: '', scheduledAt: '', notes: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  const statusOptions = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduling</h1>
          <p className="text-gray-500 text-sm">{visits.length} visit(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Schedule Visit</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn text-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Site</th><th>Client</th><th>Team</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.site?.name}</td>
                    <td className="text-gray-500">{v.site?.client?.name}</td>
                    <td className="text-gray-500">{v.team?.name}</td>
                    <td>{formatDate(v.scheduledAt)}</td>
                    <td><span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/visits/${v.id}`} className="btn btn-secondary text-xs py-1 px-2">View</Link>
                        {v.status === 'SCHEDULED' && (
                          <button className="btn btn-primary text-xs py-1 px-2" onClick={async () => { await schedulingApi.updateStatus(v.id, 'IN_PROGRESS'); load(); }}>Start</button>
                        )}
                        {v.status === 'IN_PROGRESS' && (
                          <button className="btn btn-primary text-xs py-1 px-2" onClick={async () => { await schedulingApi.updateStatus(v.id, 'COMPLETED'); load(); }}>Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!visits.length && <tr><td colSpan={6} className="text-center text-gray-400 py-12">No visits found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule New Visit">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label>Site *</label>
            <select className="input" required value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })}>
              <option value="">Select site...</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.client?.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Team *</label>
            <select className="input" required value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
              <option value="">Select team...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Date & Time *</label><input className="input" type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></div>
          <div className="form-group"><label>Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Schedule Visit'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
