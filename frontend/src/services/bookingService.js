import api from './api';

export const createBooking = (data) => api.post('/bookings', data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const getMyBookings = (params) => api.get('/bookings/my', { params });
export const getJourneyPassengers = (journeyId) => api.get(`/bookings/journey/${journeyId}`);
