const express = require('express');
const paymentController = require('../controllers/payment-controller');
const paymentRoute = express.Router()

paymentRoute.post('/create-payment',paymentController.createPayment)
paymentRoute.get('/verify-payment', paymentController.verifyPayment);

module.exports = paymentRoute

//stripe listen --forward-to localhost:4289/payment/webhook