const express = require('express');
const categoryController = require('../controllers/category-controller');
const { bodyValidator } = require('../validators/body-validator');
const { createSubCategorySchema } = require('../validators/category-schema');

const categoryRoute = express.Router();

// http://localhost:4289/category/
categoryRoute.get('/', categoryController.getCategories);

// http://localhost:4289/category/subcategory
categoryRoute.get('/subcategory', categoryController.getSubCategories);

// http://localhost:4289/category/:categoryId
categoryRoute.get('/:categoryId', categoryController.getSubCatByCat);

// http://localhost:4289/category/
categoryRoute.post('/', bodyValidator(createSubCategorySchema), categoryController.createSubCategory);

// http://localhost:4289/category/:subCatId
categoryRoute.delete('/:subCatId', categoryController.deleteSubCat);

module.exports = categoryRoute;
