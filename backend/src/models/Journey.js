/**
 * Journey model — a specific run of a Route on a specific date.
 *
 * IMPORTANT: bookedSeats is updated with atomic $inc operations, never
 * with journey.bookedSeats++ followed by journey.save(). See bookingService.js
 * for the full explanation of why.
 *
 * Indexes:
 *   - (route, date, status): the most common passenger query is
 *     "show me journeys on route X on date Y that are Scheduled"
 *   - (driver): drivers look up their assigned journeys
 *   - (date, status): admin dashboard queries
 */
const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema(
  {
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    date: { type: Date, required: true },
    departureTime: { type: String, required: true }, // "HH:MM"
    arrivalTime: { type: String },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: { type: Number, default: 0 },
    currentStop: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop' },
    delayMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

journeySchema.index({ route: 1, date: 1, status: 1 }); // passenger search
journeySchema.index({ driver: 1, date: 1 });            // driver's upcoming journeys
journeySchema.index({ date: 1, status: 1 });            // admin dashboard

// Virtual: available seats (not stored, computed on the fly)
journeySchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.bookedSeats;
});

journeySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Journey', journeySchema);
