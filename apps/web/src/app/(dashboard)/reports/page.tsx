'use client';
import { useEffect, useState } from 'react';
import { reportsApi, schedulingApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'visit' | 'monthly'>('visit');
  const [form, setForm] = useState({ visitId: '', language: 'en', year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([reportsApi.getAll(), schedulingApi.getVisits({ status: 'COMPLETED' })]).then(([r, v]) => {
      setReports(r.data);
      setVisits(v.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (type === 'visit') {
        await reportsApi.generateVisit({ visitId: form.visitId, language: form.language });
      } else {
        await reportsApi.generateMonthly({ year: form.year, month: form.month, language: form.language });
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  const typeLabels: Record<string, string> = { VISIT: 'Visit Report', MONTHLY: 'Monthly Report' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-500 text-sm">{reports.length} report(s)</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Generate Report</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Title</th><th>Type</th><th>Language</th><th>Generated</th><th>Actions</th></tr></thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.title}</td>
                    <td><span className="badge bg-blue-100 text-blue-700">{typeLabels[r.type] || r.type}</span></td>
                    <td><span className="badge bg-gray-100 text-gray-700">{r.language.toUpperCase()}</span></td>
                    <td className="text-gray-500">{formatDate(r.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-danger text-xs py-1 px-2"
                        onClick={async () => { if (confirm('Delete this report?')) { await reportsApi.delete(r.id); load(); } }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!reports.length && <tr><td colSpan={5} className="text-center text-gray-400 py-12">No reports generated yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Generate Report">
        <div className="flex gap-2 mb-4">
          <button className={`btn flex-1 ${type === 'visit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setType('visit')}>Visit Report</button>
          <button className={`btn flex-1 ${type === 'monthly' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setType('monthly')}>Monthly Report</button>
        </div>
        <form onSubmit={handleGenerate} className="space-y-4">
          {type === 'visit' ? (
            <div className="form-group">
              <label>Select Completed Visit *</label>
              <select className="input" required value={form.visitId} onChange={(e) => setForm({ ...form, visitId: e.target.value })}>
                <option value="">Select visit...</option>
                {visits.map((v) => <option key={v.id} value={v.id}>{v.site?.name} — {formatDate(v.scheduledAt)}</option>)}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group"><label>Year</label><input className="input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} /></div>
              <div className="form-group"><label>Month</label><input className="input" type="number" min={1} max={12} value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })} /></div>
            </div>
          )}
          <div className="form-group">
            <label>Language</label>
            <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Generating...' : 'Generate'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
