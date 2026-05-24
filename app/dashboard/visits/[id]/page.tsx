'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import type { Visit, ChecklistItem, Finding, ChemicalLog, Chemical, VisitStatus, FindingSeverity } from '@/lib/types';
import { formatDateTime, STATUS_COLORS, SEVERITY_COLORS } from '@/lib/utils';
import { ArrowLeft, Plus, Check, AlertTriangle, Beaker } from 'lucide-react';

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [chemLogs, setChemLogs] = useState<ChemicalLog[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newFinding, setNewFinding] = useState({ description: '', severity: 'LOW' as FindingSeverity, location: '' });
  const [newChem, setNewChem] = useState({ chemical_id: '', quantity: '' });

  async function load() {
    const supabase = createClient();
    const [{ data: v }, { data: cl }, { data: f }, { data: ch }, { data: chems }] = await Promise.all([
      supabase.from('visits').select('*, site:sites(name, client:clients(name)), team:teams(name)').eq('id', id).single(),
      supabase.from('checklist_items').select('*').eq('visit_id', id).order('created_at'),
      supabase.from('findings').select('*').eq('visit_id', id).order('created_at'),
      supabase.from('chemical_logs').select('*, chemical:chemicals(name, unit)').eq('visit_id', id).order('created_at'),
      supabase.from('chemicals').select('*').eq('is_active', true).order('name'),
    ]);
    if (v) setVisit(v as unknown as Visit);
    setChecklist(cl ?? []);
    setFindings(f ?? []);
    setChemLogs((ch ?? []) as unknown as ChemicalLog[]);
    setChemicals(chems ?? []);
  }

  useEffect(() => { load(); }, [id]);

  async function addChecklistItem() {
    if (!newItem.trim()) return;
    await createClient().from('checklist_items').insert({ visit_id: id, description: newItem.trim() });
    setNewItem('');
    load();
  }

  async function toggleItem(itemId: string, current: boolean) {
    await createClient().from('checklist_items').update({
      is_completed: !current,
      completed_at: !current ? new Date().toISOString() : null,
    }).eq('id', itemId);
    load();
  }

  async function addFinding(e: React.FormEvent) {
    e.preventDefault();
    await createClient().from('findings').insert({ ...newFinding, visit_id: id });
    setNewFinding({ description: '', severity: 'LOW', location: '' });
    load();
  }

  async function addChemLog(e: React.FormEvent) {
    e.preventDefault();
    await createClient().from('chemical_logs').insert({ ...newChem, visit_id: id, quantity: parseFloat(newChem.quantity) });
    setNewChem({ chemical_id: '', quantity: '' });
    load();
  }

  if (!visit) return <div className="p-6 text-gray-400">Loading…</div>;

  return (
    <>
      <Topbar title="Visit Detail" />
      <div className="p-6 space-y-6">
        <Link href="/dashboard/scheduling" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Scheduling
        </Link>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{(visit.site as any)?.name}</h2>
              <p className="text-sm text-gray-500">{(visit.site as any)?.client?.name} · {(visit.team as any)?.name}</p>
            </div>
            <span className={`badge ${STATUS_COLORS[visit.status]}`}>{visit.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Scheduled: </span>{formatDateTime(visit.scheduled_at)}</div>
            {visit.started_at && <div><span className="text-gray-500">Started: </span>{formatDateTime(visit.started_at)}</div>}
            {visit.completed_at && <div><span className="text-gray-500">Completed: </span>{formatDateTime(visit.completed_at)}</div>}
          </div>
          {visit.notes && <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{visit.notes}</p>}
        </div>

        {/* Checklist */}
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Check className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">Checklist ({checklist.filter(i => i.is_completed).length}/{checklist.length})</h3>
          </div>
          <div className="p-4 flex gap-2">
            <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add checklist item…" className="input flex-1"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} />
            <button onClick={addChecklistItem} className="btn-primary"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="divide-y divide-gray-100">
            {checklist.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleItem(item.id, item.is_completed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.is_completed ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                  {item.is_completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm flex-1 ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">Findings ({findings.length})</h3>
          </div>
          <form onSubmit={addFinding} className="p-4 grid grid-cols-2 gap-2">
            <input required value={newFinding.description} onChange={e => setNewFinding({ ...newFinding, description: e.target.value })} placeholder="Description *" className="input col-span-2" />
            <select value={newFinding.severity} onChange={e => setNewFinding({ ...newFinding, severity: e.target.value as FindingSeverity })} className="input">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as FindingSeverity[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={newFinding.location} onChange={e => setNewFinding({ ...newFinding, location: e.target.value })} placeholder="Location" className="input" />
            <button type="submit" className="btn-primary col-span-2 justify-center"><Plus className="w-4 h-4" /> Add Finding</button>
          </form>
          <div className="divide-y divide-gray-100">
            {findings.map(f => (
              <div key={f.id} className="px-4 py-3 flex items-start gap-3">
                <span className={`badge mt-0.5 ${SEVERITY_COLORS[f.severity]}`}>{f.severity}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{f.description}</p>
                  {f.location && <p className="text-xs text-gray-500 mt-0.5">{f.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chemicals */}
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Beaker className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">Chemicals Used</h3>
          </div>
          <form onSubmit={addChemLog} className="p-4 flex gap-2">
            <select required value={newChem.chemical_id} onChange={e => setNewChem({ ...newChem, chemical_id: e.target.value })} className="input flex-1">
              <option value="">Select chemical</option>
              {chemicals.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>)}
            </select>
            <input required type="number" step="0.1" value={newChem.quantity} onChange={e => setNewChem({ ...newChem, quantity: e.target.value })} placeholder="Qty" className="input w-24" />
            <button type="submit" className="btn-primary"><Plus className="w-4 h-4" /></button>
          </form>
          <div className="divide-y divide-gray-100">
            {chemLogs.map(l => (
              <div key={l.id} className="px-4 py-3 flex items-center text-sm">
                <span className="flex-1 font-medium text-gray-900">{(l.chemical as any)?.name}</span>
                <span className="text-gray-500">{l.quantity} {(l.chemical as any)?.unit}</span>
              </div>
            ))}
            {chemLogs.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">No chemicals logged</p>}
          </div>
        </div>
      </div>
    </>
  );
}
