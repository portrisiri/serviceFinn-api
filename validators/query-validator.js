const { z } = require('zod');

exports.queryValidator = (schema) => (req, res, next) => {
  try {
    console.log('Running Query Validator');
    req.query = { ...schema.parse(req.query) };
    next();
  } catch (error) {
    const errMsg = error.errors.map((item) => item.message);
    const errTxt = errMsg.join(',');
    const mergeError = new Error(errTxt);
    next(mergeError);
  }
};
