const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/manager/stats
// @access  Private/Manager
const getStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const usersCount = await User.countDocuments({ role: 'user' });
    const slotsCount = await Slot.countDocuments();
    
    res.json({
      totalBookings,
      activeBookings,
      usersCount,
      slotsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (manager view)
// @route   GET /api/manager/bookings
// @access  Private/Manager
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('slot', 'slotNumber type status')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new slot
// @route   POST /api/manager/slots
// @access  Private/Manager
const createSlot = async (req, res) => {
  const { slotNumber, type, pricePerHour } = req.body;
  try {
    const slotExists = await Slot.findOne({ slotNumber });
    if (slotExists) {
      return res.status(400).json({ message: 'Slot number already exists' });
    }
    const slot = new Slot({ slotNumber, type, pricePerHour });
    const createdSlot = await slot.save();
    res.status(201).json(createdSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a slot status
// @route   PUT /api/manager/slots/:id
// @access  Private/Manager
const updateSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    
    slot.status = req.body.status || slot.status;
    slot.type = req.body.type || slot.type;
    slot.pricePerHour = req.body.pricePerHour || slot.pricePerHour;

    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Approve a booking request
// @route   PUT /api/manager/bookings/:id/approve
// @access  Private/Manager
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    booking.status = 'allocated';
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.status = 'occupied';
      await slot.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a booking request
// @route   PUT /api/manager/bookings/:id/reject
// @access  Private/Manager
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    booking.status = 'rejected';
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.status = 'available';
      await slot.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllBookings,
  createSlot,
  updateSlot,
  approveBooking,
  rejectBooking,
};
