const prisma = require('../models/index');
const createError = require('../utils/create-error');

const bookingController = {};

bookingController.getBookings = async (req, res, next) => {
  try {
    const { role, id } = req.params;

    // Check when Clerk is utilized
    // const userId = req.auth.userId;
    // if (userId != id) {
    //   return createError(400, 'Unauthorized');
    // }

    let userId, providerId;

    if (role.toUpperCase() == 'USER') {
      userId = id;
      providerId = undefined;
    } else if (role.toUpperCase() == 'PROVIDER') {
      providerId = id;
      userId = undefined;
    } else {
      return createError(400, 'Incorrect Role');
    }

    const results = await prisma.booking.findMany({
      where: {
        userId,
        providerId,
      },
    });

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

module.exports = bookingController;
