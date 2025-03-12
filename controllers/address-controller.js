const prisma = require('../models/index');
const createError = require('../utils/create-error');
const addressController = {};

addressController.createAddress = async (req, res, next) => {
  try {
    const { name, address, location, userId } = req.body;

    const result = await prisma.userAddress.create({
      data: {
        name,
        address,
        location,
        userId,
      },
    });

    res.status(201).json({ result });
  } catch (error) {
    next(error);
  }
};

addressController.getAddressById = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const result = await prisma.userAddress.findFirst({
      where: {
        addressId: Number(addressId),
      },
    });

    if (!result) {
      return createError(400, 'This address entry does not exist');
    }

    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

addressController.getAddressesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { skip: skipString, take: takeString } = req.query;

    const skip = skipString ? Number(skipString) : 0;
    const take = takeString ? Number(takeString) : 10;

    const results = await prisma.userAddress.findMany({
      where: {
        userId: Number(userId),
      },
      skip,
      take,
    });

    if (results.length == 0) {
      return createError(400, 'This user has no addresses');
    }

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

addressController.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { name, address, location } = req.body;

    const ifExist = await prisma.userAddress.findFirst({
      where: {
        addressId: Number(addressId),
      },
    });

    if (!ifExist) {
      return createError(400, 'This address entry does not exist');
    }

    const result = await prisma.userAddress.update({
      where: {
        addressId: Number(addressId),
      },
      data: {
        name,
        address,
        location,
      },
    });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

addressController.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const ifExist = await prisma.userAddress.findFirst({
      where: {
        addressId: Number(addressId),
      },
    });

    if (!ifExist) {
      return createError(400, 'This address entry does not exist');
    }

    const result = await prisma.userAddress.delete({
      where: {
        addressId: Number(addressId),
      },
    });
    res.status(204).json({ result });
  } catch (error) {
    next(error);
  }
};

module.exports = addressController;
