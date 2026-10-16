const vehicleService = require('../services/vehicleService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const listVehicles = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await vehicleService.listVehicles({
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    sendPaginated(res, 200, 'Vehicles fetched', result.vehicles, result.pagination);
  } catch (err) {
    next(err);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    sendSuccess(res, 201, 'Vehicle registered', { vehicle });
  } catch (err) {
    next(err);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    sendSuccess(res, 200, 'Vehicle updated', { vehicle });
  } catch (err) {
    next(err);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    sendSuccess(res, 200, 'Vehicle deactivated');
  } catch (err) {
    next(err);
  }
};

module.exports = { listVehicles, createVehicle, updateVehicle, deleteVehicle };
