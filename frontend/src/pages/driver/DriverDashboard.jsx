import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDriverJourneys, updateJourney } from '../../services/journeyService';
import { getJourneyPassengers } from '../../services/bookingService';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaBus, FaUsers } from 'react-icons/fa';

const statusColors = {
  Scheduled: 'badge-scheduled',
  Ongoing: 'badge-ongoing',
  Completed: 'badge-confirmed',
  Cancelled: 'badge-cancelled',
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [passengersLoading, setPassengersLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDriverJourneys()
      .then((res) => setJourneys(res.data || []))
      .catch(() => setError('Failed to load journeys'))
      .finally(() => setLoading(false));
  }, []);

  const viewPassengers = async (journey) => {
    setSelected(journey);
    setPassengersLoading(true);
    try {
      const res = await getJourneyPassengers(journey._id);
      setPassengers(res.data.passengers || []);
    } catch {
      setPassengers([]);
    } finally {
      setPassengersLoading(false);
    }
  };

  const updateStatus = async (journeyId, status) => {
    setUpdating(true);
    try {
      await updateJourney(journeyId, { status });
      setJourneys((prev) => prev.map((j) => j._id === journeyId ? { ...j, status } : j));
      if (selected?._id === journeyId) setSelected((s) => ({ ...s, status }));
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <><Navbar /><LoadingSpinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-gray-500 text-sm">Hello, {user.firstName}! Your upcoming journeys.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">Your Journeys</h2>
            {journeys.length === 0 && <p className="text-gray-500 text-sm">No upcoming journeys assigned.</p>}
            {journeys.map((j) => (
              <div key={j._id} className={`card mb-3 cursor-pointer hover:border-blue-300 transition-colors ${selected?._id === j._id ? 'border-blue-400' : ''}`}
                onClick={() => viewPassengers(j)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <FaBus className="text-blue-500" />
                      {j.route?.name || j.route?.routeCode}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(j.date).toLocaleDateString()} · {j.departureTime}
                    </div>
                    <div className="text-sm text-gray-500">
                      {j.vehicle?.model} · {j.bookedSeats}/{j.totalSeats} seats
                    </div>
                  </div>
                  <span className={statusColors[j.status]}>{j.status}</span>
                </div>

                {j.status === 'Scheduled' && (
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(j._id, 'Ongoing'); }}
                    disabled={updating} className="btn-primary text-sm mt-3 w-full">
                    Start Journey
                  </button>
                )}
                {j.status === 'Ongoing' && (
                  <button onClick={(e) => { e.stopPropagation(); updateStatus(j._id, 'Completed'); }}
                    disabled={updating} className="btn-secondary text-sm mt-3 w-full">
                    Mark Completed
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-semibold text-gray-700 mb-3">
              {selected ? `Passengers — ${selected.route?.name}` : 'Select a journey to see passengers'}
            </h2>
            {passengersLoading && <LoadingSpinner text="Loading passengers..." />}
            {!passengersLoading && passengers.length === 0 && selected && (
              <p className="text-gray-500 text-sm">No confirmed passengers.</p>
            )}
            {passengers.map((b) => (
              <div key={b._id} className="card mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                    <FaUsers size={14} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{b.user.firstName} {b.user.lastName}</div>
                    <div className="text-xs text-gray-500">Seats: {b.seatNumbers.join(', ')}</div>
                    <div className="text-xs text-gray-400">{b.user.phoneNumber || b.user.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
