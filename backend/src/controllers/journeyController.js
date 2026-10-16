const journeyService = require('../services/journeyService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const searchJourneys = async (req, res, next) => {
  try {
    const { origin, destination, date, page, limit } = req.query;
    const result = await journeyService.searchJourneys({
      originId: origin,
      destinationId: destination,
      date: date || new Date().toISOString().split('T')[0],
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    // x-cache-status header tells the client (and us in testing) whether Redis was used
    res.set('x-cache-status', result.fromCache ? 'HIT' : 'MISS');
    sendPaginated(res, 200, 'Journeys found', result.journeys, result.pagination);
  } catch (err) {
    next(err);
  }
};

const createJourney = async (req, res, next) => {
  try {
    const journey = await journeyService.createJourney(req.body);
    sendSuccess(res, 201, 'Journey created', { journey });
  } catch (err) {
    next(err);
  }
};

const getJourney = async (req, res, next) => {
  try {
    const journey = await journeyService.getJourneyById(req.params.id);
    sendSuccess(res, 200, 'Journey fetched', { journey });
  } catch (err) {
    next(err);
  }
};

const listJourneys = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await journeyService.listJourneys({
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    sendPaginated(res, 200, 'Journeys fetched', result.journeys, result.pagination);
  } catch (err) {
    next(err);
  }
};

const updateJourney = async (req, res, next) => {
  try {
    const journey = await journeyService.updateJourney(req.params.id, req.body);
    sendSuccess(res, 200, 'Journey updated', { journey });
  } catch (err) {
    next(err);
  }
};

const getDriverJourneys = async (req, res, next) => {
  try {
    const result = await journeyService.getDriverJourneys({
      driverId: req.user._id,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    });
    sendPaginated(res, 200, 'Driver journeys fetched', result.journeys, result.pagination);
  } catch (err) {
    next(err);
  }
};

module.exports = { searchJourneys, createJourney, getJourney, listJourneys, updateJourney, getDriverJourneys };
