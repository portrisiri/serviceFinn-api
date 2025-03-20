const express = require('express');
const authController = require('../controllers/auth-controller');

const authRoute = express.Router();

authRoute.post('/registerUser', authController.registerUser);
authRoute.post('/registerProvider', authController.registerProvider);

module.exports = authRoute;
