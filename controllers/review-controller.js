const prisma = require('../models/index');
const createError = require('../utils/create-error');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const imageModeration = require('../utils/image-moderation');
const textModeration = require('../utils/text-moderation');

const reviewController = {};

reviewController.getReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const results = await prisma.ratingReview.findMany({
      where: {
        revieweeId: providerId,
      },
    });
    res.json({ results });
  } catch (error) {
    next(error);
  }
};

reviewController.createReview = async (req, res, next) => {
  try {
    const { bookingId, comment, image, ratingScore } = req.body;
    const clerkId = req.auth.userId;

    // ----------------------------------------------------------------------------------------------------------------------
    const textOk = textModeration(comment);
    const imageOk = imageModeration(image);

    // ----------------------------------------------------------------------------------------------------------------------

    const booking = await prisma.booking.findFirstOrThrow({
      where: {
        bookingId: Number(bookingId),
      },
    });

    if (booking.status == 'PENDING' || booking.status == 'REJECTED' || booking.status == 'CONFIRMED') {
      return createError(400, 'This job is still in progress');
    }

    if (booking.userId == clerkId) {
      const type = 'FORPROVIDER';
      const reviewerId = booking.userId;
      const revieweeId = booking.providerId;
    } else if (booking.providerId == clerkId) {
      const type = 'FORUSER';
      const reviewerId = booking.providerId;
      const revieweeId = booking.userId;
    } else {
      return createError(400, 'Not your booking');
    }

    const result = await prisma.ratingReview.create({
      data: {
        reviewerId,
        revieweeId,
        type,
        ratingScore,
        comment,
        image,
        isHidden,
      },
    });

    res.status(200).json({ message: 'Yes', result });
  } catch (error) {
    next(error);
  }
};

reviewController.updateReview = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const { comment, image, ratingScore } = req.body;

    // ----------------------------------------------------------------------------------------------------------------------
    const textOk = !comment ? true : textModeration(comment);
    const imageOk = !image ? true : imageModeration(image);
    // ----------------------------------------------------------------------------------------------------------------------

    const ifExist = await prisma.ratingReview.findFirstOrThrow({
      where: {
        ratingId,
      },
    });

    const result = await prisma.ratingReview.update({
      where: {
        ratingId: Number(ratingId),
      },
      data: {
        ratingScore,
        comment,
        image,
      },
    });

    res.status(200).json({ message: 'Yes', result });
  } catch (error) {
    next(error);
  }
};

reviewController.deleteReview = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const ifExist = await prisma.ratingReview.findFirstOrThrow({
      where: {
        ratingId: Number(ratingId),
      },
    });
    const result = await prisma.ratingReview.delete({
      where: {
        ratingId: Number(ratingId),
      },
    });
    res.json({});
  } catch (error) {
    next(error);
  }
};

module.exports = reviewController;
