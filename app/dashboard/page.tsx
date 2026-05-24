'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import { formatDate, STATUS_COLORS } from '@/lib/utils';
import type { Visit } from '@/lib/types';
import { Building2, MapPin, Calendar, CheckCircle } from 'lucide-react';

interface KPIs {
  total_clients: number;
  active_sites: number;
  scheduled_visits: number;
  completed_visits: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs>({ total_clients: 0, active_sites: 0, scheduled_visits: 0, completed_visits: 0 });
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [{ count: total_clients }, { count: active_sites }, { count: scheduled_visits }, { count: completed_visits }, { data: visits }] =
        await Promise.all([
          supabase.from('clients').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('sites').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'SCHEDULED'),
          supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED').gte('scheduled_at', monthStart),
          supabase.from('visits').select('*, site:sites(name, client:clients(name)), team:teams(name)').order('scheduled_at', { ascending: false }).limit(8),
        ]);

      setKpis({ total_clients: total_clients ?? 0, active_sites: active_sites ?? 0, scheduled_visits: scheduled_visits ?? 0, completed_visits: completed_visits ?? 0 });
      setRecentVisits((visits ?? []) as unknown as Visit[]);
    }
    load();
  }, []);

  const tiles = [
    { label: 'Active Clients', value: kpis.total_clients, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Sites', value: kpis.active_sites, icon: MapPin, color: 'text-green-600 bg-green-50' },
    { label: 'Scheduled Visits', value: kpis.scheduled_visits, icon: Calendar, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Completed (Month)', value: kpis.completed_visits, icon: CheckCircle, color: 'text-primary-600 bg-primary-50' },
  ];

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Visits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Site / Client</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Team</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Scheduled</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {recentVisits.map(v => (
                  <tr key={v.id} className="table-row">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{(v.site as any)?.name}</p>
                      <p className="text-xs text-gray-500">{(v.site as any)?.client?.name}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{(v.team as any)?.name}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(v.scheduled_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status}</span>
                    </td>
                  </tr>
                ))}
                {recentVisits.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No visits yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
