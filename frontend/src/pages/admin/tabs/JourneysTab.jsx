import React, { useState, useEffect } from 'react';
import { listJourneys, createJourney } from '../../../services/journeyService';
import { listRoutes, listVehicles, listUsers } from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const JourneysTab = () => {
  const [journeys, setJourneys] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ route: '', date: '', departureTime: '', vehicle: '', driver: '', totalSeats: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [j, r, v, d] = await Promise.all([
      listJourneys({ limit: 20 }),
      listRoutes({ isActive: true }),
      listVehicles({ status: 'Active' }),
      listUsers({ role: 'Driver' }),
    ]);
    setJourneys(j.data || []);
    setRoutes(r.data || []);
    setVehicles(v.data || []);
    setDrivers(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createJourney(form);
      setShowForm(false);
      setForm({ route: '', date: '', departureTime: '', vehicle: '', driver: '', totalSeats: '' });
      load();
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s) => ({ Scheduled: 'badge-scheduled', Ongoing: 'badge-ongoing', Completed: 'badge-confirmed', Cancelled: 'badge-cancelled' }[s] || '');

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">All Journeys ({journeys.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Schedule Journey'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Route</label>
            <select className="input" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} required>
              <option value="">Select Route</option>
              {routes.map((r) => <option key={r._id} value={r._id}>{r.routeCode} — {r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Departure Time</label>
            <input type="time" className="input" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Vehicle</label>
            <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.plateNumber} ({v.totalSeats} seats)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Driver</label>
            <select className="input" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
              <option value="">Select Driver</option>
              {drivers.map((d) => <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Total Seats</label>
            <input type="number" className="input" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} placeholder="40" required />
          </div>
          {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
          <div className="col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Scheduling...' : 'Schedule Journey'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Route</th><th className="pb-2">Date</th><th className="pb-2">Time</th>
            <th className="pb-2">Driver</th><th className="pb-2">Seats</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>
            {journeys.map((j) => (
              <tr key={j._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{j.route?.name}</td>
                <td className="py-3">{new Date(j.date).toLocaleDateString()}</td>
                <td className="py-3 font-mono text-xs">{j.departureTime}</td>
                <td className="py-3">{j.driver?.firstName} {j.driver?.lastName}</td>
                <td className="py-3">{j.bookedSeats}/{j.totalSeats}</td>
                <td className="py-3"><span className={statusBadge(j.status)}>{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {journeys.length === 0 && <p className="text-center text-gray-500 text-sm py-6">No journeys yet.</p>}
      </div>
    </div>
  );
};

export default JourneysTab;
