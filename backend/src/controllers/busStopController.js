const busStopService = require('../services/busStopService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const listBusStops = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await busStopService.listBusStops({
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    res.set('x-cache-status', result.fromCache ? 'HIT' : 'MISS');
    sendPaginated(res, 200, 'Bus stops fetched', result.stops, result.pagination);
  } catch (err) {
    next(err);
  }
};

const createBusStop = async (req, res, next) => {
  try {
    const stop = await busStopService.createBusStop(req.body);
    sendSuccess(res, 201, 'Bus stop created', { stop });
  } catch (err) {
    next(err);
  }
};

const updateBusStop = async (req, res, next) => {
  try {
    const stop = await busStopService.updateBusStop(req.params.id, req.body);
    sendSuccess(res, 200, 'Bus stop updated', { stop });
  } catch (err) {
    next(err);
  }
};

const deleteBusStop = async (req, res, next) => {
  try {
    await busStopService.deleteBusStop(req.params.id);
    sendSuccess(res, 200, 'Bus stop deactivated');
  } catch (err) {
    next(err);
  }
};

module.exports = { listBusStops, createBusStop, updateBusStop, deleteBusStop };
