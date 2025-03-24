const express = require('express');
const userController = require('../controllers/user-controller');

const userRoute = express.Router();

userRoute.get('/', userController.getUsers);
userRoute.get('/:id', userController.getUserById);


module.exports = userRoute;
