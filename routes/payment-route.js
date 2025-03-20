const express = require('express');
const paymentController = require('../controllers/payment-controller');
const paymentRoute = express.Router()

paymentRoute.post('/create-payment',paymentController.createPayment)
// paymentRoute.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);
paymentRoute.put('/verify-payment', paymentController.verifyPayment);
paymentRoute.put('/cancel-payment', paymentController.cancelPayment);
paymentRoute.put('/refund', paymentController.refundPayment);
paymentRoute.get('/list-payment', paymentController.getAllPayment);

module.exports = paymentRoute

//stripe listen --forward-to localhost:4289/payment/webhook