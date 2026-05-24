'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import type { Site, Zone, Visit } from '@/lib/types';
import { formatDate, STATUS_COLORS } from '@/lib/utils';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site & { client?: any } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [newZone, setNewZone] = useState('');

  async function load() {
    const supabase = createClient();
    const [{ data: s }, { data: z }, { data: v }] = await Promise.all([
      supabase.from('sites').select('*, client:clients(name)').eq('id', id).single(),
      supabase.from('zones').select('*').eq('site_id', id).order('name'),
      supabase.from('visits').select('*, team:teams(name)').eq('site_id', id).order('scheduled_at', { ascending: false }).limit(8),
    ]);
    if (s) setSite(s as any);
    setZones(z ?? []);
    setVisits((v ?? []) as unknown as Visit[]);
  }

  useEffect(() => { load(); }, [id]);

  async function addZone() {
    if (!newZone.trim()) return;
    await createClient().from('zones').insert({ site_id: id, name: newZone.trim() });
    setNewZone('');
    load();
  }

  async function deleteZone(zoneId: string) {
    await createClient().from('zones').delete().eq('id', zoneId);
    load();
  }

  if (!site) return <div className="p-6 text-gray-400">Loading…</div>;

  return (
    <>
      <Topbar title={site.name} />
      <div className="p-6 space-y-6">
        <Link href="/dashboard/sites" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Sites
        </Link>

        <div className="card p-5 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Client</p><p className="font-medium">{site.client?.name || '—'}</p></div>
          <div><p className="text-gray-500">Status</p><span className={`badge ${site.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{site.is_active ? 'Active' : 'Inactive'}</span></div>
          <div className="col-span-2"><p className="text-gray-500">Address</p><p className="font-medium">{site.address || '—'}</p></div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 font-medium text-gray-900">Zones</div>
          <div className="p-4 flex gap-2">
            <input value={newZone} onChange={e => setNewZone(e.target.value)} placeholder="Zone name…" className="input flex-1"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addZone())} />
            <button onClick={addZone} className="btn-primary"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <div className="divide-y divide-gray-100">
            {zones.map(z => (
              <div key={z.id} className="flex items-center px-4 py-3">
                <span className="flex-1 text-sm text-gray-900">{z.name}</span>
                <button onClick={() => deleteZone(z.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {zones.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">No zones added</p>}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 font-medium text-gray-900">Visits</div>
          <div className="divide-y divide-gray-100">
            {visits.map(v => (
              <Link key={v.id} href={`/dashboard/visits/${v.id}`} className="flex items-center px-4 py-3 hover:bg-gray-50 text-sm">
                <span className="flex-1 text-gray-700">{(v.team as any)?.name}</span>
                <span className="text-gray-500 mr-4">{formatDate(v.scheduled_at)}</span>
                <span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status}</span>
              </Link>
            ))}
            {visits.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">No visits</p>}
          </div>
        </div>
      </div>
    </>
  );
}
