import api from './api';

// Routes
export const listRoutes = (params) => api.get('/routes', { params });
export const createRoute = (data) => api.post('/routes', data);
export const updateRoute = (id, data) => api.patch(`/routes/${id}`, data);
export const deleteRoute = (id) => api.delete(`/routes/${id}`);

// Bus Stops
export const listBusStops = (params) => api.get('/bus-stops', { params });
export const createBusStop = (data) => api.post('/bus-stops', data);
export const updateBusStop = (id, data) => api.patch(`/bus-stops/${id}`, data);
export const deleteBusStop = (id) => api.delete(`/bus-stops/${id}`);

// Vehicles
export const listVehicles = (params) => api.get('/vehicles', { params });
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.patch(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Users
export const listUsers = (params) => api.get('/users', { params });
export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`);
