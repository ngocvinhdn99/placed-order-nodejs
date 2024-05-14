const Joi = require("joi");

const voucherSchema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().required(),
  quantity: Joi.number().required(),
  minOrderValue: Joi.number().required(),
  value: Joi.number().required(),
  expireAt: Joi.string().required(),
});

module.exports = voucherSchema;
