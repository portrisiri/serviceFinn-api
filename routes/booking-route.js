const express = require('express');
const bookingController = require('../controllers/booking-controller');
const { checkRole } = require('../middlewares/check-role');

const bookingRoute = express.Router();

// http://localhost:4289/booking/slots/hourly/:providerId
bookingRoute.post('/slots/hourly', bookingController.getHourlySlots);

// http://localhost:4289/booking/slots/daily/:providerId
bookingRoute.post('/slots/daily', bookingController.getDailySlots);

// http://localhost:4289/booking/slots/sections/:providerId
bookingRoute.post('/slots/sections', bookingController.getSectionSlots);

// http://localhost:4289/booking/current/:role/:id
bookingRoute.get('/current/:role/:id', bookingController.getCurrentBookings);

// http://localhost:4289/booking/history/:role/:id
bookingRoute.get('/history/:role/:id', bookingController.getPastBookings);

// http://localhost:4289/booking/
bookingRoute.post('/', bookingController.createBooking);

// http://localhost:4289/booking/details/:bookingId
bookingRoute.put('/details/:id', bookingController.createBooking);

// http://localhost:4289/booking/status/:bookingId
bookingRoute.put('/', bookingController.createBooking);

module.exports = bookingRoute;
