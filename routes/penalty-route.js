const express = require('express');
const penaltyController = require('../controllers/penalty-controller');


const penaltyRoute = express.Router();

penaltyRoute.post('/',penaltyController.createPenalty );
penaltyRoute.put('/admin/approve/:penaltyId',penaltyController.adminApprove);
penaltyRoute.get('/admin/getAllpenalty', penaltyController.adminGetAllPenalty);
penaltyRoute.get('/admin/:penaltyId', penaltyController.adminGetPenalty);
penaltyRoute.get('/user',penaltyController.userGetPenalty );


module.exports = penaltyRoute;