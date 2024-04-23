const Joi = require("joi");

const shippingAddressSchema = Joi.object({
  recipientName: Joi.string().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  isDefault: Joi.bool().required(),
  regionCode: Joi.number().required(),
});

module.exports = shippingAddressSchema;
