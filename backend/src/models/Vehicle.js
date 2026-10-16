const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    model: { type: String, required: true, trim: true },
    manufacturer: { type: String, trim: true },
    year: { type: Number },
    totalSeats: { type: Number, required: true },
    standingCapacity: { type: Number, default: 0 },
    owner: {
      name: { type: String, required: true },
      phoneNumber: { type: String },
      email: { type: String },
    },
    status: {
      type: String,
      enum: ['Active', 'In Maintenance', 'Inactive'],
      default: 'Active',
    },
    color: { type: String },
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1 }); // quickly find available vehicles

module.exports = mongoose.model('Vehicle', vehicleSchema);
