/**
 * bookingService — the most interesting file in the project.
 *
 * THE RACE CONDITION PROBLEM:
 * Imagine a bus with 1 seat left. Two passengers click "Book" at the same time.
 * Both requests hit the server simultaneously. Without atomicity:
 *
 *   Request A: reads journey → bookedSeats=49, totalSeats=50 → 1 seat free ✓
 *   Request B: reads journey → bookedSeats=49, totalSeats=50 → 1 seat free ✓
 *   Request A: creates Booking, sets bookedSeats=50
 *   Request B: creates Booking, sets bookedSeats=51  ← OVERBOOKING! 💥
 *
 * THE FIX — atomic findOneAndUpdate:
 * MongoDB's findOneAndUpdate evaluates the filter AND applies the update in a
 * single atomic operation at the database level. No two operations can overlap.
 *
 *   findOneAndUpdate(
 *     { _id: journeyId, bookedSeats: { $lte: totalSeats - seatCount } },
 *     { $inc: { bookedSeats: seatCount } }
 *   )
 *
 * If two requests run this simultaneously:
 *   - MongoDB processes them sequentially at the DB level
 *   - First one wins (succeeds, increments bookedSeats to 50)
 *   - Second one's filter no longer matches (50+1 > 50) → returns null
 *   - We check: result is null → throw 409 Conflict
 *
 * We wrap this in a MongoDB transaction so that if the Booking.create() fails
 * after we've incremented bookedSeats, the increment is rolled back automatically.
 * Atomicity = either both things happen, or neither does.
 */
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Journey = require('../models/Journey');
const AppError = require('../utils/AppError');

const createBooking = async ({ userId, journeyId, seatNumbers, paymentMethod, notes }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const seatCount = seatNumbers.length;

    // ATOMIC: find a journey that still has room AND increment bookedSeats
    // This entire operation is a single MongoDB command — no race condition possible
    const journey = await Journey.findOneAndUpdate(
      {
        _id: journeyId,
        status: 'Scheduled',
        // The filter checks availability: current bookedSeats + new seats <= totalSeats
        $expr: { $lte: [{ $add: ['$bookedSeats', seatCount] }, '$totalSeats'] },
      },
      { $inc: { bookedSeats: seatCount } },
      { new: true, session }
    ).populate('route');

    // If null: either journey not found, not Scheduled, or no seats left
    if (!journey) {
      const journeyExists = await Journey.findById(journeyId).lean();
      if (!journeyExists) throw new AppError('Journey not found', 404);
      if (journeyExists.status !== 'Scheduled') throw new AppError('Journey is not accepting bookings', 400);
      throw new AppError('No seats available for this journey', 409);
    }

    const amount = journey.route.pricePerSeat * seatCount;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const booking = await Booking.create(
      [{ user: userId, journey: journeyId, seatNumbers, amount, paymentMethod, transactionId, notes }],
      { session }
    );

    await session.commitTransaction();
    return booking[0];
  } catch (err) {
    // WriteConflict (code 112): two transactions modified the same document at the
    // same time and MongoDB chose one winner. This is expected under heavy concurrent
    // load — it means someone else got the last seat. Return 409 like any other
    // "no seats" case so the client knows to retry or show "sold out".
    try { await session.abortTransaction(); } catch (_) {}
    if (err.code === 112) {
      throw new AppError('Booking could not be completed due to a conflict — please try again', 409);
    }
    throw err;
  } finally {
    session.endSession();
  }
};

const cancelBooking = async ({ bookingId, userId }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findOne({ _id: bookingId, user: userId }).session(session);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status === 'Cancelled') throw new AppError('Booking is already cancelled', 400);

    const journey = await Journey.findById(booking.journey).session(session);
    if (journey && new Date(journey.date) <= new Date()) {
      throw new AppError('Cannot cancel a past journey booking', 400);
    }

    booking.status = 'Cancelled';
    await booking.save({ session });

    // Release the seats back
    await Journey.findByIdAndUpdate(
      booking.journey,
      { $inc: { bookedSeats: -booking.seatNumbers.length } },
      { session }
    );

    await session.commitTransaction();
    return booking;
  } catch (err) {
    try { await session.abortTransaction(); } catch (_) {}
    throw err;
  } finally {
    session.endSession();
  }
};

const getUserBookings = async ({ userId, status, page = 1, limit = 10 }) => {
  const filter = { user: userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate({ path: 'journey', populate: { path: 'route', select: 'name routeCode pricePerSeat' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getJourneyPassengers = async ({ journeyId }) => {
  return Booking.find({ journey: journeyId, status: { $ne: 'Cancelled' } })
    .populate('user', 'firstName lastName email phoneNumber')
    .sort({ createdAt: 1 })
    .lean();
};

module.exports = { createBooking, cancelBooking, getUserBookings, getJourneyPassengers };
