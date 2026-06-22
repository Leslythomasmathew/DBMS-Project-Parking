const mongoose = require('mongoose');

const slotSchema = mongoose.Schema(
  {
    slotNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: ['available', 'occupied', 'maintenance', 'reserved'],
      default: 'available',
    },
    type: {
      type: String,
      enum: ['regular', 'premium'],
      default: 'regular',
    },
    pricePerHour: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

const Slot = mongoose.model('Slot', slotSchema);
module.exports = Slot;
