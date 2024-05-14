const Joi = require("joi");

const checkoutSchema = Joi.object({
  cartId: Joi.string().required(),
});

module.exports = checkoutSchema;
