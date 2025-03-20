const express = require('express');
const serviceController = require('../controllers/service-controller');

const serviceRoute = express.Router();

serviceRoute.get('/:providerId', serviceController.getAllServicesByProviderId);
serviceRoute.get('/', serviceController.getAllServices);
serviceRoute.get('/:serviceId', serviceController.getServiceById);
serviceRoute.post('/create', serviceController.createService);
serviceRoute.put('/update/:serviceId', serviceController.createService);
serviceRoute.delete('/delete/:serviceId', serviceController.createService);


module.exports = serviceRoute;