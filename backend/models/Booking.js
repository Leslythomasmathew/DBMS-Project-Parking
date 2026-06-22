const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Slot',
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['two-wheeler', 'four-wheeler'],
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'allocated', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'upi', 'card'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'cash-pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
