const { z } = require('zod');

exports.createSubCategorySchema = z.object({
  categoryId: z.number(),
  categoryName: z.string(),
  subCatId: z.number(),
  subCatName: z.string(),
});
