'use client';
import { useEffect, useState } from 'react';
import { teamsApi, usersApi } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/utils';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([teamsApi.getAll(), usersApi.getAll()]).then(([t, u]) => {
      setTeams(t.data);
      setUsers(u.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teamsApi.create(form);
      setShowModal(false);
      setForm({ name: '' });
      load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Teams</h1><p className="text-gray-500 text-sm">{teams.length} team(s)</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Team</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <span className="badge bg-blue-100 text-blue-700">{t.members?.length ?? 0} members</span>
              </div>
              {t.leader && (
                <p className="text-sm text-gray-500 mb-3">
                  Leader: <span className="font-medium text-gray-700">{t.leader.firstName} {t.leader.lastName}</span>
                </p>
              )}
              <div className="space-y-2">
                {t.members?.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {m.user.firstName[0]}{m.user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.user.firstName} {m.user.lastName}</p>
                    </div>
                    <span className={`badge text-xs ${ROLE_COLORS[m.user.role]}`}>{ROLE_LABELS[m.user.role]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!teams.length && (
            <div className="col-span-3 text-center py-12 text-gray-400">No teams yet</div>
          )}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group"><label>Team Name *</label><input className="input" required value={form.name} onChange={(e) => setForm({ name: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
