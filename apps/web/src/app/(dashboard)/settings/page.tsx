'use client';
import { useEffect, useState } from 'react';
import { organizationsApi, chemicalsApi, branchesApi } from '@/lib/api';
import Modal from '@/components/ui/Modal';

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [tab, setTab] = useState<'org' | 'chemicals' | 'branches'>('org');
  const [loading, setLoading] = useState(true);
  const [showChemModal, setShowChemModal] = useState(false);
  const [chemForm, setChemForm] = useState({ name: '', activeIngredient: '', unit: 'ml' });
  const [orgForm, setOrgForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([organizationsApi.getMe(), chemicalsApi.getAll(), branchesApi.getAll()]).then(([o, c, b]) => {
      setOrg(o.data);
      setChemicals(c.data);
      setBranches(b.data);
      setOrgForm({ name: o.data.name, email: o.data.email || '', phone: o.data.phone || '', address: o.data.address || '' });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await organizationsApi.update(orgForm); load(); } finally { setSaving(false); }
  };

  const saveChem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await chemicalsApi.create(chemForm);
      setShowChemModal(false);
      setChemForm({ name: '', activeIngredient: '', unit: 'ml' });
      load();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1></div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['org', 'branches', 'chemicals'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'org' ? 'Organization' : t}
          </button>
        ))}
      </div>

      {tab === 'org' && (
        <div className="card max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Organization Info</h2>
          <form onSubmit={saveOrg} className="space-y-4">
            <div className="form-group"><label>Name</label><input className="input" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} /></div>
            <div className="form-group"><label>Email</label><input className="input" type="email" value={orgForm.email} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} /></div>
            <div className="form-group"><label>Phone</label><input className="input" value={orgForm.phone} onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} /></div>
            <div className="form-group"><label>Address</label><input className="input" value={orgForm.address} onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })} /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'branches' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Branches ({branches.length})</h2>
          <div className="table-container">
            <table>
              <thead><tr><th>Branch Name</th><th>Address</th><th>Phone</th><th>Status</th></tr></thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id}>
                    <td className="font-medium">{b.name}</td>
                    <td className="text-gray-500">{b.address || '—'}</td>
                    <td className="text-gray-500">{b.phone || '—'}</td>
                    <td><span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
                {!branches.length && <tr><td colSpan={4} className="text-center text-gray-400 py-8">No branches</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'chemicals' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chemicals ({chemicals.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowChemModal(true)}>+ Add Chemical</button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Active Ingredient</th><th>Unit</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {chemicals.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-gray-500">{c.activeIngredient || '—'}</td>
                    <td className="text-gray-500">{c.unit}</td>
                    <td><span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td><button className="btn btn-secondary text-xs py-1 px-2" onClick={async () => { await chemicalsApi.toggleActive(c.id); load(); }}>{c.isActive ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}
                {!chemicals.length && <tr><td colSpan={5} className="text-center text-gray-400 py-8">No chemicals</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showChemModal} onClose={() => setShowChemModal(false)} title="Add Chemical">
        <form onSubmit={saveChem} className="space-y-4">
          <div className="form-group"><label>Name *</label><input className="input" required value={chemForm.name} onChange={(e) => setChemForm({ ...chemForm, name: e.target.value })} /></div>
          <div className="form-group"><label>Active Ingredient</label><input className="input" value={chemForm.activeIngredient} onChange={(e) => setChemForm({ ...chemForm, activeIngredient: e.target.value })} /></div>
          <div className="form-group">
            <label>Unit</label>
            <select className="input" value={chemForm.unit} onChange={(e) => setChemForm({ ...chemForm, unit: e.target.value })}>
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowChemModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Chemical'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
