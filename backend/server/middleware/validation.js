const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    age: Joi.number().min(13).max(120).optional(),
    country: Joi.string().max(100).optional(),
    city: Joi.string().max(100).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  review: Joi.object({
    text: Joi.string().min(10).max(1000).required(),
    rating: Joi.number().min(1).max(5).required(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    country: Joi.string().max(100).optional(),
  }),

  profile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    age: Joi.number().min(13).max(120).optional(),
    country: Joi.string().max(100).optional(),
    city: Joi.string().max(100).optional(),
    bio: Joi.string().max(500).optional(),
  }),
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validate,
  schemas,
};