import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import { listBusStops } from '../../services/adminService';
import { searchJourneys, getJourney } from '../../services/journeyService';
import { createBooking } from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';
import { FaBus, FaTicketAlt, FaSearch, FaTimes } from 'react-icons/fa';

const statusBadge = {
  Confirmed: 'badge-confirmed',
  Cancelled: 'badge-cancelled',
  Pending: 'badge-scheduled',
  Completed: 'badge-ongoing',
};

const PassengerDashboard = () => {
  const { user } = useAuth();
  const [view, setView] = useState('search'); // 'search' | 'bookings'
  const [stops, setStops] = useState([]);
  const [search, setSearch] = useState({ origin: '', destination: '', date: '' });
  const [journeys, setJourneys] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingJourney, setBookingJourney] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    listBusStops().then((res) => setStops(res.data || [])).catch(() => {});
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data || []);
    } catch {}
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await searchJourneys(search);
      setJourneys(res.data || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const startBooking = async (journey) => {
    const res = await getJourney(journey._id);
    setBookingJourney(res.data.journey);
    setSelectedSeats([]);
  };

  const handleBook = async () => {
    if (!selectedSeats.length) return;
    setBookingLoading(true);
    setError('');
    try {
      await createBooking({ journeyId: bookingJourney._id, seatNumbers: selectedSeats });
      setSuccess('Booking confirmed!');
      setBookingJourney(null);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      fetchBookings();
      setSuccess('Booking cancelled.');
    } catch (err) {
      setError(err.message || 'Cancel failed');
    }
  };

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const available = bookingJourney ? bookingJourney.totalSeats - bookingJourney.bookedSeats : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user.firstName}!</h1>
          <p className="text-gray-500 text-sm">Find and book your campus shuttle</p>
        </div>

        {(error || success) && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {error || success}
            <button className="ml-2 float-right" onClick={() => { setError(''); setSuccess(''); }}>×</button>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button onClick={() => setView('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'search' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
            <FaSearch /> Find Journey
          </button>
          <button onClick={() => { setView('bookings'); fetchBookings(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'bookings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
            <FaTicketAlt /> My Bookings
          </button>
        </div>

        {view === 'search' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-semibold mb-4 text-gray-800">Search journeys</h2>
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">From</label>
                  <select className="input" value={search.origin} onChange={(e) => setSearch({ ...search, origin: e.target.value })} required>
                    <option value="">Select stop</option>
                    {stops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">To</label>
                  <select className="input" value={search.destination} onChange={(e) => setSearch({ ...search, destination: e.target.value })} required>
                    <option value="">Select stop</option>
                    {stops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input type="date" className="input" value={search.date}
                    onChange={(e) => setSearch({ ...search, date: e.target.value })} required />
                </div>
                <div className="sm:col-span-3">
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
            </div>

            {loading && <LoadingSpinner />}

            {journeys.length > 0 && (
              <div className="space-y-3">
                {journeys.map((j) => (
                  <div key={j._id} className="card flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{j.route?.name}</div>
                      <div className="text-sm text-gray-500">
                        {j.departureTime} · {j.route?.pricePerSeat} ₹/seat
                      </div>
                      <div className="text-sm text-gray-500">
                        {j.totalSeats - j.bookedSeats} seats available
                      </div>
                    </div>
                    <button onClick={() => startBooking(j)} className="btn-primary text-sm"
                      disabled={j.bookedSeats >= j.totalSeats}>
                      {j.bookedSeats >= j.totalSeats ? 'Full' : 'Book'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {journeys.length === 0 && !loading && search.origin && (
              <p className="text-center text-gray-500 text-sm py-8">No journeys found for this route and date.</p>
            )}
          </div>
        )}

        {view === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-12">No bookings yet.</div>
            )}
            {bookings.map((b) => (
              <div key={b._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{b.journey?.route?.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(b.journey?.date).toLocaleDateString()} · {b.journey?.departureTime}
                    </div>
                    <div className="text-sm text-gray-500">
                      Seats: {b.seatNumbers.join(', ')} · ₹{b.amount}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">#{b._id.slice(-6).toUpperCase()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={statusBadge[b.status] || 'badge-scheduled'}>{b.status}</span>
                    {b.status === 'Confirmed' && (
                      <button onClick={() => handleCancel(b._id)} className="text-xs text-red-600 hover:underline">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {bookingJourney && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{bookingJourney.route?.name}</h2>
              <button onClick={() => setBookingJourney(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-1">{bookingJourney.departureTime} · {available} seats left</p>
            <p className="text-sm text-gray-500 mb-4">₹{bookingJourney.route?.pricePerSeat}/seat</p>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Select seats</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: available }, (_, i) => `${Math.floor(i / 4) + 1}${['A','B','C','D'][i % 4]}`).map((seat) => (
                  <button key={seat} onClick={() => toggleSeat(seat)}
                    className={`py-2 rounded text-sm font-medium border transition-colors ${
                      selectedSeats.includes(seat)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}>
                    {seat}
                  </button>
                ))}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                Total: ₹{bookingJourney.route?.pricePerSeat * selectedSeats.length} for {selectedSeats.length} seat(s)
              </p>
            )}

            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

            <button onClick={handleBook} disabled={!selectedSeats.length || bookingLoading}
              className="btn-primary w-full">
              {bookingLoading ? 'Confirming...' : `Confirm Booking`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDashboard;
