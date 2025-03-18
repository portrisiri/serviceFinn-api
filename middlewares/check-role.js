const { clerkClient } = require('@clerk/express');
const createError = require('../utils/create-error');

exports.checkRole =
  (...roles) =>
  async (req, res, next) => {
    // Call the function and pass the desired role as the argument
    // The function then fetches the user's role
    // Check against the roles passed as argument

    try {
      console.log('req.auth', req.auth);
      console.log('userId', req.auth.userId);
      !req.auth.userId && createError(400, 'No token');
      req.user = await clerkClient.users.getUser(req.auth.userId);
      console.log(req.auth);
      const userRole = req.auth.publicMetadata.role;
      if ([...roles].some((role) => role === userRole)) {
        next();
      } else {
        throw createError(400, 'Unauthorized');
      }
    } catch (error) {
      next(error);
    }
  };
