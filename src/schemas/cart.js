const Joi = require("joi");

const cartSchema = Joi.object({
  skuId: Joi.string().required(),
  quantity: Joi.number().required(),
});

module.exports = cartSchema;
