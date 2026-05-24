'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import type { Chemical } from '@/lib/types';
import { Plus, Beaker, Pencil } from 'lucide-react';

export default function ChemicalsPage() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Chemical | null>(null);
  const [form, setForm] = useState({ name: '', active_ingredient: '', unit: 'ml' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await createClient().from('chemicals').select('*').order('name');
    setChemicals(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm({ name: '', active_ingredient: '', unit: 'ml' }); setShowModal(true); }
  function openEdit(c: Chemical) { setEditing(c); setForm({ name: c.name, active_ingredient: c.active_ingredient ?? '', unit: c.unit }); setShowModal(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    if (editing) {
      await supabase.from('chemicals').update(form).eq('id', editing.id);
    } else {
      await supabase.from('chemicals').insert(form);
    }
    setShowModal(false);
    setSaving(false);
    load();
  }

  async function toggleActive(c: Chemical) {
    await createClient().from('chemicals').update({ is_active: !c.is_active }).eq('id', c.id);
    load();
  }

  return (
    <>
      <Topbar title="Chemicals" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Chemical</button>
        </div>

        <div className="card divide-y divide-gray-100">
          {chemicals.map(c => (
            <div key={c.id} className="flex items-center px-5 py-4">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                <Beaker className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.active_ingredient || '—'} · {c.unit}</p>
              </div>
              <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-gray-600 p-1.5 mr-2"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => toggleActive(c)} className={`badge cursor-pointer ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
          {chemicals.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No chemicals yet</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit Chemical' : 'New Chemical'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="input" />
              <input value={form.active_ingredient} onChange={e => setForm({ ...form, active_ingredient: e.target.value })} placeholder="Active ingredient" className="input" />
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input">
                {['ml', 'g', 'L', 'kg', 'tablet'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
