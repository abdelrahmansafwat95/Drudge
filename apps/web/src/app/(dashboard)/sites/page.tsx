'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sitesApi, clientsApi } from '@/lib/api';
import Modal from '@/components/ui/Modal';

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientId: '', name: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([sitesApi.getAll(), clientsApi.getAll()]).then(([s, c]) => {
      setSites(s.data);
      setClients(c.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sitesApi.create(form);
      setShowModal(false);
      setForm({ clientId: '', name: '', address: '', notes: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sites</h1>
          <p className="text-gray-500 text-sm">{sites.length} site(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Site</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Site Name</th><th>Client</th><th>Address</th><th>Zones</th><th>Visits</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td><Link href={`/sites/${s.id}`} className="font-medium text-blue-600 hover:underline">{s.name}</Link></td>
                    <td className="text-gray-500">{s.client?.name}</td>
                    <td className="text-gray-500">{s.address || '—'}</td>
                    <td>{s.zones?.length ?? 0}</td>
                    <td>{s._count?.visits ?? 0}</td>
                    <td><span className={`badge ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td><Link href={`/sites/${s.id}`} className="btn btn-secondary text-xs py-1 px-2">View</Link></td>
                  </tr>
                ))}
                {!sites.length && <tr><td colSpan={7} className="text-center text-gray-400 py-12">No sites found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Site">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label>Client *</label>
            <select className="input" required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Site Name *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="form-group"><label>Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Site'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
