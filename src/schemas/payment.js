const Joi = require("joi");

const paymentSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
});

module.exports = paymentSchema;
