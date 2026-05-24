'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import type { Visit } from '@/lib/types';
import { formatDate, STATUS_COLORS } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  async function load() {
    const { data } = await createClient()
      .from('visits')
      .select('*, site:sites(name, client:clients(name)), team:teams(name)')
      .gte('scheduled_at', from)
      .lte('scheduled_at', to + 'T23:59:59')
      .order('scheduled_at');
    setVisits((data ?? []) as unknown as Visit[]);
  }

  useEffect(() => { load(); }, [from, to]);

  const completed = visits.filter(v => v.status === 'COMPLETED').length;
  const cancelled = visits.filter(v => v.status === 'CANCELLED').length;

  function exportCSV() {
    const rows = [
      ['Date', 'Site', 'Client', 'Team', 'Status'],
      ...visits.map(v => [
        formatDate(v.scheduled_at),
        (v.site as any)?.name ?? '',
        (v.site as any)?.client?.name ?? '',
        (v.team as any)?.name ?? '',
        v.status,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'visits-report.csv'; a.click();
  }

  return (
    <>
      <Topbar title="Reports" />
      <div className="p-6 space-y-6">
        <div className="card p-5">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="text-sm text-gray-500 block mb-1">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input" />
            </div>
            <button onClick={exportCSV} className="btn-secondary ml-auto"><Download className="w-4 h-4" /> Export CSV</button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-5">
            {[
              { label: 'Total', value: visits.length, color: 'text-gray-900' },
              { label: 'Completed', value: completed, color: 'text-green-600' },
              { label: 'Cancelled', value: cancelled, color: 'text-red-600' },
              { label: 'Rate', value: visits.length ? `${Math.round(completed / visits.length * 100)}%` : '—', color: 'text-primary-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Site</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Client</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Team</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {visits.map(v => (
                <tr key={v.id} className="table-row">
                  <td className="px-5 py-3 text-gray-600">{formatDate(v.scheduled_at)}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{(v.site as any)?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{(v.site as any)?.client?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{(v.team as any)?.name}</td>
                  <td className="px-5 py-3"><span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status}</span></td>
                </tr>
              ))}
              {visits.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No visits in this period</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
