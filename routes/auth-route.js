const express = require('express');
const authController = require('../controllers/auth-controller');

const authRoute = express.Router();

authRoute.post('/', authController.registerUser);

module.exports = authRoute;
