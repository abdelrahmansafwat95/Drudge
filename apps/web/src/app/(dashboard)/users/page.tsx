'use client';
import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

const ROLES = ['ADMIN', 'MANAGER', 'TEAM_LEADER', 'AGENT'];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'AGENT', password: 'Admin@123' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    usersApi.getAll().then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.create(form);
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'AGENT', password: 'Admin@123' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Staff Members</h1><p className="text-gray-500 text-sm">{users.length} user(s)</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Staff</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <span className="font-medium">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="text-gray-500">{u.email}</td>
                    <td className="text-gray-500">{u.phone || '—'}</td>
                    <td><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                    <td><span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button
                        className="btn btn-secondary text-xs py-1 px-2"
                        onClick={async () => { await usersApi.toggleActive(u.id); load(); }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && <tr><td colSpan={6} className="text-center text-gray-400 py-12">No staff members</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label>First Name *</label><input className="input" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="form-group"><label>Last Name *</label><input className="input" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group">
            <label>Role *</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Initial Password</label><input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Staff'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
