const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

/**
 * Automates the cleanup of expired parking allocations.
 * Checks for bookings that have passed their `endTime` safely.
 */
const releaseExpiredSlots = async () => {
  try {
    const now = new Date();

    // Find all bookings that are either currently active or allocated whose endTime is in the past
    const expiredBookings = await Booking.find({
      status: { $in: ['allocated', 'active'] },
      endTime: { $lte: now }
    });

    if (expiredBookings.length > 0) {
      console.log(`[SYSTEM SWEEP] Found ${expiredBookings.length} expired bookings. Initiating release protocols...`);

      for (let booking of expiredBookings) {
        // Change booking status to completed
        booking.status = 'completed';
        await booking.save();

        // Release the physical slot back to the public pool
        const slot = await Slot.findById(booking.slot);
        if (slot) {
          slot.status = 'available';
          await slot.save();
          console.log(`[SYSTEM SWEEP] Slot ${slot.slotNumber} has been successfully freed.`);
        }
      }
    }
  } catch (error) {
    console.error(`[SYSTEM SWEEP ERROR] Failed to release slots: ${error.message}`);
  }
};

module.exports = {
  releaseExpiredSlots
};
