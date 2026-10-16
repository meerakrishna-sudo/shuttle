/**
 * User model.
 *
 * Indexes:
 *   - email: unique index (enforces no duplicate accounts, speeds up login lookup)
 *
 * We store passwordHash, never the plain password.
 * bcrypt hashing happens in authService before saving.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    role: {
      type: String,
      enum: ['Passenger', 'Driver', 'Admin'],
      required: true,
      default: 'Passenger',
    },
    licenseNumber: { type: String, trim: true }, // drivers only
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for listing active drivers (used when assigning to journeys)
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
