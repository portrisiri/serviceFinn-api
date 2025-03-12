const { z } = require('zod');

exports.bodyValidator = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errMsg = error.errors.map((item) => item.message);
    const errTxt = errMsg.join(',');
    const mergeError = new Error(errTxt);
    next(mergeError);
  }
};
