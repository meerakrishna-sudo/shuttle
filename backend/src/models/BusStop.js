/**
 * BusStop model.
 *
 * Text index on `name` enables full-text search (e.g. "find stops matching 'gate'").
 * This is faster than a regex scan when the collection is large.
 */
const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

busStopSchema.index({ name: 'text' }); // enables $text search
busStopSchema.index({ isActive: 1 });

module.exports = mongoose.model('BusStop', busStopSchema);
