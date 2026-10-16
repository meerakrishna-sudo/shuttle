const bookingService = require('../services/bookingService');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user._id,
      ...req.body,
    });
    sendSuccess(res, 201, 'Booking confirmed', { booking });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking({
      bookingId: req.params.id,
      userId: req.user._id,
    });
    sendSuccess(res, 200, 'Booking cancelled', { booking });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await bookingService.getUserBookings({
      userId: req.user._id,
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    sendPaginated(res, 200, 'Bookings fetched', result.bookings, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getJourneyPassengers = async (req, res, next) => {
  try {
    const passengers = await bookingService.getJourneyPassengers({ journeyId: req.params.journeyId });
    sendSuccess(res, 200, 'Passengers fetched', { passengers });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, cancelBooking, getMyBookings, getJourneyPassengers };
