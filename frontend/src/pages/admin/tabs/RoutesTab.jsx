import React, { useState, useEffect } from 'react';
import { listRoutes, createRoute, updateRoute, deleteRoute, listBusStops } from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const RoutesTab = () => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ routeCode: '', name: '', origin: '', destination: '', pricePerSeat: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [r, s] = await Promise.all([listRoutes({ isActive: true }), listBusStops()]);
    setRoutes(r.data || []);
    setStops(s.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createRoute(form);
      setShowForm(false);
      setForm({ routeCode: '', name: '', origin: '', destination: '', pricePerSeat: '' });
      load();
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this route?')) return;
    await deleteRoute(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Routes ({routes.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Add Route'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-2 gap-3">
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Route Code</label>
              <input className="input" value={form.routeCode} onChange={(e) => setForm({ ...form, routeCode: e.target.value })} placeholder="R01" required />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campus – City" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Origin</label>
            <select className="input" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required>
              <option value="">Select</option>
              {stops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Destination</label>
            <select className="input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required>
              <option value="">Select</option>
              {stops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Price/Seat (₹)</label>
            <input type="number" className="input" value={form.pricePerSeat} onChange={(e) => setForm({ ...form, pricePerSeat: e.target.value })} placeholder="50" required />
          </div>
          {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
          <div className="col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Creating...' : 'Create Route'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Code</th><th className="pb-2">Name</th>
            <th className="pb-2">From</th><th className="pb-2">To</th>
            <th className="pb-2">Price</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r._id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-mono text-xs">{r.routeCode}</td>
                <td className="py-3">{r.name}</td>
                <td className="py-3 text-gray-500">{r.origin?.name}</td>
                <td className="py-3 text-gray-500">{r.destination?.name}</td>
                <td className="py-3">₹{r.pricePerSeat}</td>
                <td className="py-3">
                  <button onClick={() => handleDeactivate(r._id)} className="text-red-500 hover:underline text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {routes.length === 0 && <p className="text-center text-gray-500 text-sm py-6">No routes yet.</p>}
      </div>
    </div>
  );
};

export default RoutesTab;
