const express = require('express');
const bookingController = require('../controllers/booking-controller');

const bookingRoute = express.Router();

bookingRoute.post('/slots/hourly', bookingController.getHourlySlots);
bookingRoute.post('/slots/daily', bookingController.getDailySlots);
bookingRoute.post('/slots/sections', bookingController.getSectionSlots);
bookingRoute.get('/current/:role/:id', bookingController.getCurrentBookings);
bookingRoute.get('/history/:role/:id', bookingController.getPastBookings);
bookingRoute.post('/', bookingController.createBooking);

module.exports = bookingRoute;
