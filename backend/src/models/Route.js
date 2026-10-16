/**
 * Route model.
 *
 * A Route is the static template: "Bus goes from Stop A to Stop B via C, D".
 * A Journey is a specific instance of a Route on a date ("Route 42 on Dec 5th").
 *
 * This separation (Route vs Journey) is a good schema design decision to mention:
 * - Route data rarely changes → good candidate for Redis caching
 * - Journey data changes often (seats, status) → don't cache aggressively
 */
const mongoose = require('mongoose');

const stopTimingSchema = new mongoose.Schema(
  {
    stop: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
    arrivalOffset: { type: Number, default: 0 }, // minutes from departure
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    routeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
    intermediateStops: [stopTimingSchema],
    pricePerSeat: { type: Number, required: true, min: 0 },
    estimatedDuration: { type: Number }, // minutes
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

routeSchema.index({ isActive: 1 });
routeSchema.index({ origin: 1, destination: 1 }); // compound — searching routes by from/to

module.exports = mongoose.model('Route', routeSchema);
