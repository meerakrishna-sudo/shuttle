import api from './api';

export const searchJourneys = (params) => api.get('/journeys/search', { params });
export const getJourney = (id) => api.get(`/journeys/${id}`);
export const listJourneys = (params) => api.get('/journeys', { params });
export const createJourney = (data) => api.post('/journeys', data);
export const updateJourney = (id, data) => api.patch(`/journeys/${id}`, data);
export const getDriverJourneys = (params) => api.get('/journeys/my', { params });
