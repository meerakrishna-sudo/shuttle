import React, { useState, useEffect } from 'react';
import { listVehicles, createVehicle, deleteVehicle } from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plateNumber: '', model: '', manufacturer: '', totalSeats: '', owner: { name: '' } });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await listVehicles({ limit: 100 });
    setVehicles(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createVehicle(form);
      setShowForm(false);
      setForm({ plateNumber: '', model: '', manufacturer: '', totalSeats: '', owner: { name: '' } });
      load();
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s) => {
    if (s === 'Active') return 'badge-confirmed';
    if (s === 'In Maintenance') return 'badge-ongoing';
    return 'badge-cancelled';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Vehicles ({vehicles.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Register Vehicle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Plate Number</label>
            <input className="input" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} placeholder="KA01AA1234" required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Model</label>
            <input className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Volvo 9400" required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Manufacturer</label>
            <input className="input" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="Volvo" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Total Seats</label>
            <input type="number" className="input" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} placeholder="40" required />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Owner Name</label>
            <input className="input" value={form.owner.name} onChange={(e) => setForm({ ...form, owner: { name: e.target.value } })} placeholder="Campus Transport" required />
          </div>
          {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
          <div className="col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Registering...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Plate</th><th className="pb-2">Model</th>
            <th className="pb-2">Seats</th><th className="pb-2">Status</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-mono text-xs">{v.plateNumber}</td>
                <td className="py-3">{v.manufacturer} {v.model}</td>
                <td className="py-3">{v.totalSeats}</td>
                <td className="py-3"><span className={statusBadge(v.status)}>{v.status}</span></td>
                <td className="py-3">
                  <button onClick={async () => { if (confirm('Deactivate?')) { await deleteVehicle(v._id); load(); } }}
                    className="text-red-500 hover:underline text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vehicles.length === 0 && <p className="text-center text-gray-500 text-sm py-6">No vehicles yet.</p>}
      </div>
    </div>
  );
};

export default VehiclesTab;
