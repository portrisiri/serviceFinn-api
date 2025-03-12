const express = require('express');
const categoryController = require('../controllers/category-controller');

const categoryRoute = express.Router();

categoryRoute.post('/', categoryController.getCategories);

module.exports = categoryRoute;
