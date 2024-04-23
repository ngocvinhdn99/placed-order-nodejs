const Joi = require("joi");

const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        skuId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddressId: Joi.string().required(),
  voucherIds: Joi.array().items(Joi.string()).required(),
  paymentId: Joi.string().required(),
  deliveryId: Joi.string().required(),
  // priceTotal: Joi.number().required(),
  note: Joi.string(),
});

module.exports = orderSchema;
