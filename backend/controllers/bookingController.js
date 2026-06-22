const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  if (req.user.role === 'manager') {
    return res.status(403).json({ message: 'Managers are not allowed to book slots.' });
  }

  const { slotId, startTime, endTime, vehicleType } = req.body;
  console.log(`[DEBUG] Incoming Booking Request:`, req.body);

  try {
    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ message: 'Slot is currently not available' });
    }

    // Calculate total amount based on vehicle type and duration
    const hours = Math.ceil(Math.abs(new Date(endTime) - new Date(startTime)) / 36e5) || 1;
    
    let basePrice = 0;
    if (slot.type === 'premium') {
      if (vehicleType === 'two-wheeler') basePrice = 150;
      else if (vehicleType === 'four-wheeler') basePrice = 200;
      else return res.status(400).json({ message: 'Invalid vehicle type specified' });
    } else {
      if (vehicleType === 'two-wheeler') basePrice = 100;
      else if (vehicleType === 'four-wheeler') basePrice = 150;
      else return res.status(400).json({ message: 'Invalid vehicle type specified' });
    }

    const totalAmount = basePrice + (hours > 1 ? (hours - 1) * 50 : 0);

    const booking = new Booking({
      user: req.user._id,
      slot: slotId,
      vehicleType,
      startTime,
      endTime,
      totalAmount,
    });

    const createdBooking = await booking.save();

    // Change slot status immediately to reserved upon booking request
    slot.status = 'reserved';
    await slot.save();

    console.log(`[NOTIFICATION] Booking request created for user ${req.user.email}. Booking ID: ${createdBooking._id}. Awaiting manager allocation.`);

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process mock payment
// @route   PUT /api/bookings/:id/pay
// @access  Private
const processPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'manager') {
      return res.status(401).json({ message: 'Not authorized for this booking' });
    }

    const { paymentMode } = req.body;
    if (!['cash', 'upi', 'card'].includes(paymentMode)) {
      return res.status(400).json({ message: 'Invalid payment mode selected' });
    }

    booking.paymentMode = paymentMode;

    if (paymentMode === 'cash') {
      booking.paymentStatus = 'cash-pending';
      booking.status = 'active'; // Mark as fully active even if cash is pending
      console.log(`[PAYMENT] Booking ${booking._id} set to Cash Pending and Active`);
    } else {
      booking.paymentStatus = 'completed';
      booking.status = 'active';
      console.log(`[PAYMENT] Digital payment successful for booking ${booking._id}`);
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('slot', 'slotNumber type')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user._id.toString() !== booking.user.toString() && req.user.role !== 'manager') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the slot
    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.status = 'available';
      await slot.save();
    }

    console.log(`[NOTIFICATION] Booking cancelled for user ${req.user.email}`);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  processPayment,
  getMyBookings,
  cancelBooking,
};
