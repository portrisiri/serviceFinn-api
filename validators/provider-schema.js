const { z } = require('zod');

exports.filterProviderSchema = z
  .object({
    latitude: z
      .string({
        required_error: 'Latitude of current location is required',
      })
      .transform((val) => Number(val))
      .pipe(z.number().gte(-90, 'Latitude must be greater than -90').lte(90, 'Latitude must be less than 90')),
    longitude: z
      .string({
        required_error: 'Longitude of current location is required',
      })
      .transform((val) => Number(val))
      .pipe(z.number().gte(-180, 'Longitude must be greater than -180').lte(180, 'Longitude must be less than 180')),
    subCatId: z
      .string()
      .regex(/^\d{2}$/, 'Invalid SubCatId')
      .optional(),
    radius: z
      .string()
      .regex(/^\d{1,3}$/, 'Radius must be between 0 and 100 (km)')
      .optional(),
    orderBy: z
      .string()
      .transform((val) => val.toUpperCase())
      .pipe(z.enum(['DISTANCE', 'RATING', 'PRICE'], 'Currently supported filter options: distance, rating, price'))
      .optional(),
    sort: z
      .string()
      .transform((val) => val.toUpperCase())
      .pipe(z.enum(['ASC', 'DESC'], 'Invalid sorting order, please select ASC or DESC'))
      .optional(),
    skip: z
      .string()
      .regex(/^\d+$/, 'Invalid skip amount')
      .transform((val) => Number(val))
      .optional(),
    take: z
      .string()
      .regex(/^\d+$/, 'Invalid take amount')
      .transform((val) => Number(val))
      .optional(),
  })
  .refine(
    (data) => {
      // If fieldA is present, fieldB must also be present (and vice versa)
      if (data.sort && !data.orderBy) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify which criteria to sort by',
      path: ['orderBy', 'sort'], // You can specify the fields where the error should be reported
    }
  )
  .refine(
    (data) => {
      // If fieldA is present, fieldB must also be present (and vice versa)
      if (data.skip && !data.take) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify the number of data to take',
      path: ['take', 'skip'], // You can specify the fields where the error should be reported
    }
  );
