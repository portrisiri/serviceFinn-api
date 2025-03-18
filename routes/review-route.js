const express = require('express');
const reviewController = require('../controllers/review-controller');

const reviewRoute = express.Router();

reviewRoute.post('/', reviewController.createReview);
reviewRoute.get('/:providerId', reviewController.getReviews);
reviewRoute.put('/:ratingId', reviewController.updateReview);
reviewRoute.delete('/:ratingId', reviewController.deleteReview);

module.exports = reviewRoute;
