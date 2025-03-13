const express = require('express');
const addressController = require('../controllers/address-controller');
const { bodyValidator } = require('../validators/body-validator');
const { createAddressSchema } = require('../validators/address-schema');

const addressRoute = express.Router();

// http://localhost:4289/address/
addressRoute.post('/', bodyValidator(createAddressSchema), addressController.createAddress);

// http://localhost:4289/address/:addressId
addressRoute.get('/:addressId', addressController.getAddressById);

// http://localhost:4289/address/:userId
addressRoute.get('/:userId', addressController.getAddressesByUserId);

// http://localhost:4289/address/:addressId
addressRoute.put('/:addressId', addressController.updateAddress);

// http://localhost:4289/address/:addressId
addressRoute.delete('/:addressId', addressController.deleteAddress);

module.exports = addressRoute;
