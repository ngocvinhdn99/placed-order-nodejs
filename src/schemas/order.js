const Joi = require("joi");

const orderSchema = Joi.object({
  cartId: Joi.string().required(),
  shippingAddressId: Joi.string().required(),
  voucherIds: Joi.array().items(Joi.string()).required(),
  deliveryId: Joi.string().required(),
  // priceTotal: Joi.number().required(),
  note: Joi.string(),
});

module.exports = orderSchema;
