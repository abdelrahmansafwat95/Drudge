'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import type { Client } from '@/lib/types';
import { Plus, Search, ChevronRight, Building2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', contact_name: '', contact_email: '', contact_phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const q = supabase.from('clients').select('*').order('name');
    if (search) q.ilike('name', `%${search}%`);
    const { data } = await q;
    setClients(data ?? []);
  }

  useEffect(() => { load(); }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('clients').insert(form);
    setForm({ name: '', contact_name: '', contact_email: '', contact_phone: '', address: '' });
    setShowModal(false);
    setSaving(false);
    load();
  }

  return (
    <>
      <Topbar title="Clients" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" className="input pl-9" />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary ml-auto">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>

        <div className="card divide-y divide-gray-100">
          {clients.map(c => (
            <Link key={c.id} href={`/dashboard/clients/${c.id}`} className="flex items-center px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{c.name}</p>
                {c.contact_name && <p className="text-sm text-gray-500">{c.contact_name} {c.contact_phone ? `· ${c.contact_phone}` : ''}</p>}
              </div>
              <span className={`badge mr-4 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
          {clients.length === 0 && <p className="px-5 py-8 text-center text-gray-400">No clients found</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-4">New Client</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client name *" className="input" />
              <input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder="Contact name" className="input" />
              <input value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} placeholder="Contact email" className="input" />
              <input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} placeholder="Contact phone" className="input" />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="input" />
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
