'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { clientsApi } from '@/lib/api';
import { formatDate, STATUS_COLORS } from '@/lib/utils';

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [tab, setTab] = useState<'sites' | 'contracts' | 'visits'>('sites');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clientsApi.getOne(id as string),
      clientsApi.getVisitHistory(id as string),
    ]).then(([c, v]) => {
      setClient(c.data);
      setVisits(v.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!client) return <p className="text-center py-20 text-gray-500">Client not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/clients" className="hover:text-blue-600">Clients</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client.name}</span>
      </div>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-500 mt-1">{client.address}</p>
          </div>
          <span className={`badge ${client.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {client.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Contact Person</p>
            <p className="font-medium mt-1">{client.contactName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p className="font-medium mt-1">{client.contactEmail || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
            <p className="font-medium mt-1">{client.contactPhone || '—'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['sites', 'contracts', 'visits'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t} {t === 'sites' ? `(${client.sites?.length ?? 0})` : t === 'visits' ? `(${visits.length})` : `(${client.contracts?.length ?? 0})`}
          </button>
        ))}
      </div>

      {tab === 'sites' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Site Name</th><th>Address</th><th>Zones</th><th>Visits</th><th></th></tr></thead>
              <tbody>
                {client.sites?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td className="text-gray-500">{s.address || '—'}</td>
                    <td>{s.zones?.length ?? 0}</td>
                    <td>{s._count?.visits ?? 0}</td>
                    <td><Link href={`/sites/${s.id}`} className="btn btn-secondary text-xs py-1 px-2">View</Link></td>
                  </tr>
                ))}
                {!client.sites?.length && <tr><td colSpan={5} className="text-center text-gray-400 py-8">No sites</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'contracts' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Title</th><th>Start</th><th>End</th><th>Value</th></tr></thead>
              <tbody>
                {client.contracts?.map((c: any) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.title}</td>
                    <td>{formatDate(c.startDate)}</td>
                    <td>{formatDate(c.endDate)}</td>
                    <td>{c.value ? `$${c.value.toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
                {!client.contracts?.length && <tr><td colSpan={4} className="text-center text-gray-400 py-8">No contracts</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'visits' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Site</th><th>Team</th><th>Scheduled</th><th>Status</th></tr></thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.site?.name}</td>
                    <td className="text-gray-500">{v.team?.name}</td>
                    <td>{formatDate(v.scheduledAt)}</td>
                    <td><span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
                {!visits.length && <tr><td colSpan={4} className="text-center text-gray-400 py-8">No visits</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
