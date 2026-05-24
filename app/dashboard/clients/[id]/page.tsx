'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import type { Client, Site, Visit } from '@/lib/types';
import { formatDate, STATUS_COLORS } from '@/lib/utils';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sites').select('*').eq('client_id', id).order('name'),
      supabase.from('visits').select('*, site:sites(name), team:teams(name)').eq('site.client_id', id).order('scheduled_at', { ascending: false }).limit(10),
    ]).then(([{ data: c }, { data: s }, { data: v }]) => {
      if (c) setClient(c);
      setSites(s ?? []);
      setVisits((v ?? []) as unknown as Visit[]);
    });
  }, [id]);

  if (!client) return <div className="p-6 text-gray-400">Loading…</div>;

  return (
    <>
      <Topbar title={client.name} />
      <div className="p-6 space-y-6">
        <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Clients
        </Link>

        <div className="card p-5 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Contact</p><p className="font-medium">{client.contact_name || '—'}</p></div>
          <div><p className="text-gray-500">Email</p><p className="font-medium">{client.contact_email || '—'}</p></div>
          <div><p className="text-gray-500">Phone</p><p className="font-medium">{client.contact_phone || '—'}</p></div>
          <div><p className="text-gray-500">Address</p><p className="font-medium">{client.address || '—'}</p></div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">Sites ({sites.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sites.map(s => (
              <Link key={s.id} href={`/dashboard/sites/${s.id}`} className="flex items-center px-4 py-3 hover:bg-gray-50">
                <span className="flex-1 text-sm font-medium text-gray-900">{s.name}</span>
                <span className={`badge ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
              </Link>
            ))}
            {sites.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">No sites</p>}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">Recent Visits</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {visits.map(v => (
              <Link key={v.id} href={`/dashboard/visits/${v.id}`} className="flex items-center px-4 py-3 hover:bg-gray-50 text-sm">
                <span className="flex-1 text-gray-700">{(v.site as any)?.name} · {(v.team as any)?.name}</span>
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
