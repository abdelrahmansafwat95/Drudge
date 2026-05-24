'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import type { Site, Client } from '@/lib/types';
import { Plus, Search, MapPin, ChevronRight } from 'lucide-react';

export default function SitesPage() {
  const [sites, setSites] = useState<(Site & { client: Pick<Client, 'name'> })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', client_id: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const q = supabase.from('sites').select('*, client:clients(name)').order('name');
    if (search) q.ilike('name', `%${search}%`);
    const { data } = await q;
    setSites((data ?? []) as any);
  }

  useEffect(() => {
    load();
    createClient().from('clients').select('id, name').eq('is_active', true).order('name').then(({ data }) => setClients((data ?? []) as any));
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createClient().from('sites').insert(form);
    setForm({ name: '', client_id: '', address: '', notes: '' });
    setShowModal(false);
    setSaving(false);
    load();
  }

  return (
    <>
      <Topbar title="Sites" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sites…" className="input pl-9" />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary ml-auto"><Plus className="w-4 h-4" /> Add Site</button>
        </div>

        <div className="card divide-y divide-gray-100">
          {sites.map(s => (
            <Link key={s.id} href={`/dashboard/sites/${s.id}`} className="flex items-center px-5 py-4 hover:bg-gray-50">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.client?.name} {s.address ? `· ${s.address}` : ''}</p>
              </div>
              <span className={`badge mr-4 ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
          {sites.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No sites found</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">New Site</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Site name *" className="input" />
              <select required value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="input">
                <option value="">Select client *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="input" />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="input h-20 resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
