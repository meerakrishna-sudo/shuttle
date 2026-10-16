const routeService = require('../services/routeService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const listRoutes = async (req, res, next) => {
  try {
    const { isActive, page, limit } = req.query;
    const result = await routeService.listRoutes({
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.set('x-cache-status', result.fromCache ? 'HIT' : 'MISS');
    sendPaginated(res, 200, 'Routes fetched', result.routes, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getRoute = async (req, res, next) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    sendSuccess(res, 200, 'Route fetched', { route });
  } catch (err) {
    next(err);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const route = await routeService.createRoute(req.body);
    sendSuccess(res, 201, 'Route created', { route });
  } catch (err) {
    next(err);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const route = await routeService.updateRoute(req.params.id, req.body);
    sendSuccess(res, 200, 'Route updated', { route });
  } catch (err) {
    next(err);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    await routeService.deleteRoute(req.params.id);
    sendSuccess(res, 200, 'Route deactivated');
  } catch (err) {
    next(err);
  }
};

module.exports = { listRoutes, getRoute, createRoute, updateRoute, deleteRoute };
