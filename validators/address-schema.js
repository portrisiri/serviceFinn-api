const { z } = require('zod');

exports.createAddressSchema = z.object({
  name: z.string(),
  address: z.string(),
  location: z.string(),
  userId: z.string(),
});
