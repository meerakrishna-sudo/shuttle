const Route = require('../models/Route');
const { getCache, setCache, deleteCache } = require('../config/redis');
const AppError = require('../utils/AppError');

// Routes change rarely → cache for 10 minutes
const CACHE_TTL = 600;

const listRoutes = async ({ isActive, page = 1, limit = 20 }) => {
  const cacheKey = `routes:list:${isActive}:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;
  const [routes, total] = await Promise.all([
    Route.find(filter)
      .populate('origin', 'name code')
      .populate('destination', 'name code')
      .sort({ routeCode: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Route.countDocuments(filter),
  ]);

  const result = { routes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  await setCache(cacheKey, result, CACHE_TTL);
  return { ...result, fromCache: false };
};

const getRouteById = async (id) => {
  const route = await Route.findById(id)
    .populate('origin', 'name code coordinates')
    .populate('destination', 'name code coordinates')
    .populate('intermediateStops.stop', 'name code')
    .lean();

  if (!route) throw new AppError('Route not found', 404);
  return route;
};

const createRoute = async (data) => {
  const route = await Route.create(data);
  await deleteCache('routes:*');
  return route;
};

const updateRoute = async (id, updates) => {
  const route = await Route.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!route) throw new AppError('Route not found', 404);
  await deleteCache('routes:*');
  return route;
};

const deleteRoute = async (id) => {
  const route = await Route.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!route) throw new AppError('Route not found', 404);
  await deleteCache('routes:*');
  return route;
};

module.exports = { listRoutes, getRouteById, createRoute, updateRoute, deleteRoute };
