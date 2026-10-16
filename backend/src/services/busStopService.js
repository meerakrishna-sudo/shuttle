const BusStop = require('../models/BusStop');
const { getCache, setCache, deleteCache } = require('../config/redis');
const AppError = require('../utils/AppError');

const CACHE_TTL = 1800; // 30 min — bus stops almost never change

const listBusStops = async ({ search, page = 1, limit = 50 }) => {
  const cacheKey = `busstops:${search || 'all'}:${page}:${limit}`;
  if (!search) {
    const cached = await getCache(cacheKey);
    if (cached) return { ...cached, fromCache: true };
  }

  const filter = { isActive: true };
  if (search) {
    filter.$text = { $search: search }; // uses the text index
  }

  const skip = (page - 1) * limit;
  const [stops, total] = await Promise.all([
    BusStop.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    BusStop.countDocuments(filter),
  ]);

  const result = { stops, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  if (!search) await setCache(cacheKey, result, CACHE_TTL);
  return { ...result, fromCache: false };
};

const createBusStop = async (data) => {
  const stop = await BusStop.create(data);
  await deleteCache('busstops:*');
  return stop;
};

const updateBusStop = async (id, updates) => {
  const stop = await BusStop.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!stop) throw new AppError('Bus stop not found', 404);
  await deleteCache('busstops:*');
  return stop;
};

const deleteBusStop = async (id) => {
  const stop = await BusStop.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!stop) throw new AppError('Bus stop not found', 404);
  await deleteCache('busstops:*');
  return stop;
};

module.exports = { listBusStops, createBusStop, updateBusStop, deleteBusStop };
