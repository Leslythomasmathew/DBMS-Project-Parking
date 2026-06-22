const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllBookings,
  createSlot,
  updateSlot,
  approveBooking,
  rejectBooking
} = require('../controllers/managerController');
const { protect, manager } = require('../middleware/auth');

router.use(protect, manager);

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.post('/slots', createSlot);
router.put('/slots/:id', updateSlot);
router.put('/bookings/:id/approve', approveBooking);
router.put('/bookings/:id/reject', rejectBooking);

module.exports = router;
