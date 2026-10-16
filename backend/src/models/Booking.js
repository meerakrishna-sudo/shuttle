/**
 * Booking model.
 *
 * seatNumbers stores individual seat strings in an array (not a comma-joined string).
 * This makes queries like "is seat 5A taken?" possible without string splitting.
 *
 * Compound unique index on (journeyId, seatNumbers) ensures the same seat
 * cannot be booked twice, even if the application logic somehow fails.
 * This is the database-level safety net.
 *
 * Indexes:
 *   - (userId, status): passenger fetches "my upcoming confirmed bookings"
 *   - (journeyId): admin/driver views all passengers on a journey
 */
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    journey: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey', required: true },
    seatNumbers: { type: [String], required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Card', 'UPI', 'Cash'], default: 'UPI' },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Pending', 'Completed'],
      default: 'Confirmed',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ journey: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
