'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clientsApi } from '@/lib/api';
import Modal from '@/components/ui/Modal';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', contactName: '', contactEmail: '', contactPhone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    clientsApi.getAll({ search }).then((r) => setClients(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clientsApi.create(form);
      setShowModal(false);
      setForm({ name: '', contactName: '', contactEmail: '', contactPhone: '', address: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm">{clients.length} client(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
      </div>

      <div className="card">
        <div className="mb-4">
          <input
            className="input max-w-xs"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Sites</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/clients/${c.id}`} className="font-medium text-blue-600 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="text-gray-600">{c.contactName || '—'}</td>
                    <td className="text-gray-600">{c.contactPhone || '—'}</td>
                    <td>{c._count?.sites ?? 0}</td>
                    <td>
                      <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/clients/${c.id}`} className="btn btn-secondary text-xs py-1 px-2">View</Link>
                        <button
                          className="btn btn-secondary text-xs py-1 px-2"
                          onClick={async () => { await clientsApi.toggleActive(c.id); load(); }}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-12">No clients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Client">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label>Company Name *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input className="input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Client'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
