'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { schedulingApi, chemicalsApi } from '@/lib/api';
import { formatDateTime, STATUS_COLORS, SEVERITY_COLORS } from '@/lib/utils';

export default function VisitDetailPage() {
  const { id } = useParams();
  const [visit, setVisit] = useState<any>(null);
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newFinding, setNewFinding] = useState({ description: '', severity: 'LOW', location: '' });
  const [showFindingForm, setShowFindingForm] = useState(false);

  const load = () => {
    Promise.all([schedulingApi.getVisit(id as string), chemicalsApi.getAll()]).then(([v, c]) => {
      setVisit(v.data);
      setChemicals(c.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const toggleItem = async (itemId: string) => {
    await schedulingApi.toggleChecklistItem(id as string, itemId);
    load();
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    await schedulingApi.addChecklistItem(id as string, { description: newItem });
    setNewItem('');
    load();
  };

  const addFinding = async () => {
    await schedulingApi.addFinding(id as string, newFinding);
    setNewFinding({ description: '', severity: 'LOW', location: '' });
    setShowFindingForm(false);
    load();
  };

  const updateStatus = async (status: string) => {
    await schedulingApi.updateStatus(id as string, status);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!visit) return <p className="text-center py-20 text-gray-500">Visit not found</p>;

  const completed = visit.checklistItems?.filter((i: any) => i.isCompleted).length;
  const total = visit.checklistItems?.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/visits" className="hover:text-blue-600">Visits</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{visit.site?.name}</span>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{visit.site?.name}</h1>
            <p className="text-gray-500">{visit.site?.client?.name}</p>
            <p className="text-gray-500 text-sm mt-1">Team: {visit.team?.name}</p>
            <p className="text-gray-500 text-sm">Scheduled: {formatDateTime(visit.scheduledAt)}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`badge text-sm ${STATUS_COLORS[visit.status]}`}>{visit.status.replace('_', ' ')}</span>
            <div className="flex gap-2">
              {visit.status === 'SCHEDULED' && <button className="btn btn-primary text-sm" onClick={() => updateStatus('IN_PROGRESS')}>Start Visit</button>}
              {visit.status === 'IN_PROGRESS' && <button className="btn btn-primary text-sm" onClick={() => updateStatus('COMPLETED')}>Complete Visit</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Checklist ({completed}/{total})</h2>
          </div>
          {total > 0 && (
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
              </div>
            </div>
          )}
          <div className="space-y-2">
            {visit.checklistItems?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                <input type="checkbox" checked={item.isCompleted} onChange={() => toggleItem(item.id)} className="w-4 h-4 rounded" />
                <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.description}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input className="input" placeholder="Add checklist item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <button className="btn btn-primary" onClick={addItem}>Add</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Findings ({visit.findings?.length ?? 0})</h2>
            <button className="btn btn-secondary text-sm" onClick={() => setShowFindingForm(!showFindingForm)}>+ Add</button>
          </div>
          {showFindingForm && (
            <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <textarea className="input" placeholder="Description..." rows={2} value={newFinding.description} onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })} />
              <input className="input" placeholder="Location" value={newFinding.location} onChange={(e) => setNewFinding({ ...newFinding, location: e.target.value })} />
              <select className="input" value={newFinding.severity} onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <div className="flex gap-2"><button className="btn btn-primary text-sm" onClick={addFinding}>Save</button><button className="btn btn-secondary text-sm" onClick={() => setShowFindingForm(false)}>Cancel</button></div>
            </div>
          )}
          <div className="space-y-3">
            {visit.findings?.map((f: any) => (
              <div key={f.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className={`badge text-xs ${SEVERITY_COLORS[f.severity]}`}>{f.severity}</span>
                  {f.location && <span className="text-xs text-gray-400">{f.location}</span>}
                </div>
                <p className="text-sm text-gray-700">{f.description}</p>
              </div>
            ))}
            {!visit.findings?.length && <p className="text-gray-400 text-sm">No findings recorded</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Chemical Usage ({visit.chemicalLogs?.length ?? 0})</h2>
        <div className="table-container">
          <table>
            <thead><tr><th>Chemical</th><th>Quantity</th><th>Unit</th><th>Notes</th></tr></thead>
            <tbody>
              {visit.chemicalLogs?.map((log: any) => (
                <tr key={log.id}>
                  <td className="font-medium">{log.chemical?.name}</td>
                  <td>{log.quantity}</td>
                  <td className="text-gray-500">{log.chemical?.unit}</td>
                  <td className="text-gray-500">{log.notes || '—'}</td>
                </tr>
              ))}
              {!visit.chemicalLogs?.length && <tr><td colSpan={4} className="text-center text-gray-400 py-4">No chemicals logged</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
