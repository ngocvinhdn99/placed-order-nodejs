const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().required(),
});

module.exports = productSchema;
