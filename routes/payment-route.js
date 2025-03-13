const express = require('express');
const paymentController = require('../controllers/payment-controller');
const paymentRoute = express.Router()

paymentRoute.post('/create-payment',paymentController.createPayment)
paymentRoute.put('/update-payment',paymentController.updatePaymentStatus)

module.exports = paymentRoute