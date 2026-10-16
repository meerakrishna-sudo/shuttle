const Journey = require('../models/Journey');
const { getCache, setCache, deleteCache } = require('../config/redis');
const AppError = require('../utils/AppError');

const CACHE_TTL = 120; // 2 minutes — journeys change (seats book up), don't cache long

const searchJourneys = async ({ originId, destinationId, date, page = 1, limit = 10 }) => {
  const cacheKey = `journeys:search:${originId}:${destinationId}:${date}:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // We need journeys where the route goes from origin to destination.
  // This requires a lookup into the Route collection — handled via populate + filter.
  const skip = (page - 1) * limit;

  const [journeys, total] = await Promise.all([
    Journey.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'Scheduled' })
      .populate({
        path: 'route',
        match: { origin: originId, destination: destinationId, isActive: true },
        select: 'name routeCode pricePerSeat estimatedDuration',
        populate: [
          { path: 'origin', select: 'name code' },
          { path: 'destination', select: 'name code' },
        ],
      })
      .populate('vehicle', 'model manufacturer plateNumber')
      .select('-driver -notes')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Journey.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, status: 'Scheduled' }),
  ]);

  // Filter out journeys where route didn't match (populate returns null for non-matching)
  const filtered = journeys.filter((j) => j.route !== null);
  const result = {
    journeys: filtered,
    pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(total / limit) },
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return { ...result, fromCache: false };
};

const createJourney = async (data) => {
  const journey = await Journey.create(data);
  await deleteCache('journeys:*'); // invalidate any cached journey searches
  return journey;
};

const getJourneyById = async (id) => {
  const journey = await Journey.findById(id)
    .populate('route', 'name routeCode pricePerSeat intermediateStops')
    .populate('vehicle', 'model plateNumber totalSeats')
    .populate('driver', 'firstName lastName phoneNumber')
    .populate('currentStop', 'name code')
    .lean();

  if (!journey) throw new AppError('Journey not found', 404);
  return journey;
};

const listJourneys = async ({ status, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [journeys, total] = await Promise.all([
    Journey.find(filter)
      .populate('route', 'name routeCode')
      .populate('driver', 'firstName lastName')
      .sort({ date: 1, departureTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Journey.countDocuments(filter),
  ]);

  return { journeys, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateJourney = async (id, updates) => {
  const journey = await Journey.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!journey) throw new AppError('Journey not found', 404);
  await deleteCache('journeys:*');
  return journey;
};

const getDriverJourneys = async ({ driverId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [journeys, total] = await Promise.all([
    Journey.find({ driver: driverId, date: { $gte: today } })
      .populate('route', 'name routeCode')
      .populate('vehicle', 'model plateNumber')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Journey.countDocuments({ driver: driverId, date: { $gte: today } }),
  ]);

  return { journeys, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

module.exports = { searchJourneys, createJourney, getJourneyById, listJourneys, updateJourney, getDriverJourneys };
