'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sitesApi } from '@/lib/api';

export default function SiteDetailPage() {
  const { id } = useParams();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddZone, setShowAddZone] = useState(false);
  const [zoneName, setZoneName] = useState('');

  const load = () => {
    sitesApi.getOne(id as string).then((r) => setSite(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const addZone = async () => {
    if (!zoneName.trim()) return;
    await sitesApi.addZone(id as string, { name: zoneName });
    setZoneName('');
    setShowAddZone(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!site) return <p className="text-center py-20 text-gray-500">Site not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/sites" className="hover:text-blue-600">Sites</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{site.name}</span>
      </div>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{site.name}</h1>
            <p className="text-gray-500 mt-1">Client: {site.client?.name}</p>
            <p className="text-gray-500">{site.address}</p>
          </div>
          <span className={`badge ${site.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{site.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Zones ({site.zones?.length ?? 0})</h2>
          <button className="btn btn-primary text-sm" onClick={() => setShowAddZone(!showAddZone)}>+ Add Zone</button>
        </div>
        {showAddZone && (
          <div className="flex gap-2 mb-4">
            <input className="input" placeholder="Zone name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
            <button className="btn btn-primary" onClick={addZone}>Add</button>
            <button className="btn btn-secondary" onClick={() => setShowAddZone(false)}>Cancel</button>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {site.zones?.map((z: any) => (
            <div key={z.id} className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-sm">{z.name}</p>
              {z.description && <p className="text-xs text-gray-500 mt-1">{z.description}</p>}
            </div>
          ))}
          {!site.zones?.length && <p className="text-gray-400 text-sm col-span-3">No zones defined yet</p>}
        </div>
      </div>
    </div>
  );
}
