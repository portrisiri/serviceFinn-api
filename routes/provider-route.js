const express = require('express');
const providerController = require('../controllers/provider-controller');

const providerRoute = express.Router();

providerRoute.get('/', providerController.getAllProviders);
providerRoute.get('/filter', providerController.getFilteredProviders);
providerRoute.get('/:id', providerController.getProviderById);
providerRoute.put('/update', providerController.updateProviderProfile);
providerRoute.put('/activate', providerController.activateProvider);
providerRoute.put('/deactivate', providerController.deactivateProvider);

module.exports = providerRoute;
