import React, { useState, useEffect } from 'react';
import { listBusStops, createBusStop, deleteBusStop } from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const BusStopsTab = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async (q = '') => {
    setLoading(true);
    const res = await listBusStops({ search: q || undefined, limit: 100 });
    setStops(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createBusStop(form);
      setShowForm(false);
      setForm({ name: '', code: '' });
      load();
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input className="input max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stops..." />
          <button type="submit" className="btn-secondary text-sm">Search</button>
        </form>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Add Stop'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campus Gate" required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CG01" required />
          </div>
          {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
          <div className="col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Creating...' : 'Create Stop'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Name</th><th className="pb-2">Code</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {stops.map((s) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{s.name}</td>
                <td className="py-3 font-mono text-xs">{s.code}</td>
                <td className="py-3">
                  <button onClick={async () => { if (confirm('Deactivate?')) { await deleteBusStop(s._id); load(); } }}
                    className="text-red-500 hover:underline text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stops.length === 0 && <p className="text-center text-gray-500 text-sm py-6">No stops yet.</p>}
      </div>
    </div>
  );
};

export default BusStopsTab;
