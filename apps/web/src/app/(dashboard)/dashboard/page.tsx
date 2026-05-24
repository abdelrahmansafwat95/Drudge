'use client';
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { formatDateTime, STATUS_COLORS } from '@/lib/utils';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getKPIs(),
      dashboardApi.getRecentVisits(),
      dashboardApi.getVisitsByStatus(),
    ]).then(([k, v, c]) => {
      setKpis(k.data);
      setRecentVisits(v.data);
      setChartData(c.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const stats = [
    { label: 'Active Clients', value: kpis?.totalClients ?? 0, icon: '🏢', color: 'bg-blue-500' },
    { label: 'Total Sites', value: kpis?.totalSites ?? 0, icon: '📍', color: 'bg-indigo-500' },
    { label: 'Active Teams', value: kpis?.totalTeams ?? 0, icon: '👥', color: 'bg-cyan-500' },
    { label: 'Active Agents', value: kpis?.activeAgents ?? 0, icon: '👤', color: 'bg-teal-500' },
    { label: 'Total Visits', value: kpis?.totalVisits ?? 0, icon: '📋', color: 'bg-violet-500' },
    { label: 'Completed', value: kpis?.completedVisits ?? 0, icon: '✅', color: 'bg-green-500' },
    { label: 'Scheduled', value: kpis?.scheduledVisits ?? 0, icon: '📅', color: 'bg-yellow-500' },
    { label: 'Completion Rate', value: `${kpis?.completionRate ?? 0}%`, icon: '📊', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Operations overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Visits</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Client</th>
                  <th>Team</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.site?.name}</td>
                    <td className="text-gray-500">{v.site?.client?.name}</td>
                    <td className="text-gray-500">{v.team?.name}</td>
                    <td className="text-gray-500">{formatDateTime(v.scheduledAt)}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[v.status]}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentVisits.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8">No visits yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Visits by Status</h2>
          <div className="space-y-3">
            {chartData.map((d) => (
              <div key={d.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{d.status.replace('_', ' ')}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: kpis?.totalVisits ? `${(d.count / kpis.totalVisits) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
