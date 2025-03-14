const express = require('express');
const bookingController = require('../controllers/booking-controller');

const bookingRoute = express.Router();

bookingRoute.get('/:role/:id', bookingController.getBookings);

module.exports = bookingRoute;
