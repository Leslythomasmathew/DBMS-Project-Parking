const Slot = require('../models/Slot');

// @desc    Get all slots
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res) => {
  try {
    const slots = await Slot.find({}).sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single slot
// @route   GET /api/slots/:id
// @access  Public
const getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (slot) {
      res.json(slot);
    } else {
      res.status(404).json({ message: 'Slot not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSlots,
  getSlotById,
};
