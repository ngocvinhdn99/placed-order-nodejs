const Joi = require("joi");

const skuSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
});

module.exports = skuSchema;
