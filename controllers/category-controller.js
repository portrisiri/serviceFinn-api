const prisma = require('../models/index');
const createError = require('../utils/create-error');

const categoryController = {};

categoryController.getCategories = async (req, res, next) => {
  try {
    const results = await prisma.category.findMany({
      distinct: ['categoryId'],
      select: {
        categoryId: true,
        categoryName: true,
      },
    });
    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

categoryController.getSubCategories = async (req, res, next) => {
  try {
    const results = await prisma.category.findMany({});
    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

categoryController.getSubCatByCat = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const results = await prisma.category.findMany({
      where: {
        categoryId: Number(categoryId),
      },
    });
    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

categoryController.createSubCategory = async (req, res, next) => {
  try {
    const { categoryId, categoryName, subCatName, subCatId, categoryIcon } = req.body;
    const ifExist = await prisma.category.findMany({
      where: {
        OR: [
          {
            subCatName,
          },
          { subCatId },
        ],
      },
    });

    if (ifExist.length < 0) {
      return createError(400, 'Subcategory already exists');
    }

    const result = await prisma.category.create({
      data: {
        categoryId,
        categoryName,
        subCatName,
        subCatId,
        categoryIcon,
      },
    });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

categoryController.deleteSubCat = async (req, res, next) => {
  try {
    const { subCatId } = req.params;
    const ifExist = await prisma.category.findFirst({
      where: {
        subCatId: Number(subCatId),
      },
    });
    if (!ifExist) {
      return createError(400, 'Subcategory does not exist');
    }

    const result = await prisma.category.delete({
      where: {
        subCatId: Number(subCatId),
      },
    });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

module.exports = categoryController;
