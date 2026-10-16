const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

const listVehicles = async ({ status, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter).sort({ plateNumber: 1 }).skip(skip).limit(limit).lean(),
    Vehicle.countDocuments(filter),
  ]);

  return { vehicles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const createVehicle = async (data) => Vehicle.create(data);

const updateVehicle = async (id, updates) => {
  const vehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
};

const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findByIdAndUpdate(id, { status: 'Inactive' }, { new: true });
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
};

module.exports = { listVehicles, createVehicle, updateVehicle, deleteVehicle };
