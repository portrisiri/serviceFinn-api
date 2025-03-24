const prisma = require('../models/index')

const { clerkClient } = require('@clerk/express');

const userController = {};

userController.getUsers = async (req, res, next) => {
  try {
    // code here
  } catch (error) {
    next(error);
  }
};


userController.getUserById = async (req, res, next) => {
    try {
      const userId = req.params.id;

      const user = await prisma.user.findUnique({
        where: {
          userId: userId,
        },
        include: {
          UserAddress: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Extract necessary data for the frontend
      const userData = {
        userId: user.userId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        UserAddress: user.UserAddress,
      };
  
      res.json(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = userController;
