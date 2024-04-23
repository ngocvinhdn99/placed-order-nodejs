const Joi = require("joi");

const voucherSchema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().required(),
  type: Joi.string().required(),
  quantityTotal: Joi.number().required(),
  quantityRemaining: Joi.number().required(),
  minOrderValue: Joi.number().required(),
  value: Joi.number().required(),
  expireAt: Joi.string().required(),
  appliedPaymentMethodIds: Joi.array().required(),
});

module.exports = voucherSchema;
