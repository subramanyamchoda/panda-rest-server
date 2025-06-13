const express = require('express');
const router = express.Router();
const { bookTable, getBookings ,checkBooking} = require('../controllers/bookingControllers');

router.post('/send', bookTable);
router.get('/get', getBookings);
router.post('/check',checkBooking);
module.exports = router;
