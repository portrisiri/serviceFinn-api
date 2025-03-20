const express = require('express');
const providerController = require('../controllers/provider-controller');
const { queryValidator } = require('../validators/query-validator');
const { filterProviderDistaneSchema, filterProviderSchema } = require('../validators/provider-schema');

const providerRoute = express.Router();

// LatLong not required! http://localhost:4289/provider/
providerRoute.get('/', queryValidator(filterProviderSchema), providerController.getAllProviders);

// LatLong REQUIRED!!! http://localhost:4289/provider/filter
providerRoute.get('/filter', queryValidator(filterProviderDistaneSchema), providerController.getFilteredProviders);

providerRoute.get('/:id', providerController.getProviderById);
providerRoute.put('/update', providerController.updateProviderProfile);
providerRoute.put('/activate', providerController.activateProvider);
providerRoute.put('/deactivate', providerController.deactivateProvider);

module.exports = providerRoute;
