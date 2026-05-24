'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { schedulingApi } from '@/lib/api';
import { formatDateTime, STATUS_COLORS } from '@/lib/utils';

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schedulingApi.getVisits().then((r) => setVisits(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visits</h1>
        <p className="text-gray-500 text-sm">{visits.length} total visit(s)</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Client</th>
                  <th>Team</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Checklist</th>
                  <th>Findings</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.site?.name}</td>
                    <td className="text-gray-500">{v.site?.client?.name}</td>
                    <td className="text-gray-500">{v.team?.name}</td>
                    <td className="text-gray-500">{formatDateTime(v.scheduledAt)}</td>
                    <td><span className={`badge ${STATUS_COLORS[v.status]}`}>{v.status.replace('_', ' ')}</span></td>
                    <td>{v.checklistItems?.filter((i: any) => i.isCompleted).length}/{v.checklistItems?.length}</td>
                    <td>{v.findings?.length ?? 0}</td>
                    <td><Link href={`/visits/${v.id}`} className="btn btn-secondary text-xs py-1 px-2">View</Link></td>
                  </tr>
                ))}
                {!visits.length && <tr><td colSpan={8} className="text-center text-gray-400 py-12">No visits</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
