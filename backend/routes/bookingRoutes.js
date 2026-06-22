const express = require('express');
const router = express.Router();
const {
  createBooking,
  processPayment,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createBooking);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id/pay').put(protect, processPayment);
router.route('/:id/cancel').put(protect, cancelBooking);

module.exports = router;
