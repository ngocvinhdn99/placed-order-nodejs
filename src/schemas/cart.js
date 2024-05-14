const Joi = require("joi");

exports.cartSchema = Joi.object({
  warehouseId: Joi.string().required(),
  skuId: Joi.string().required(),
  quantity: Joi.number().required(),
});

exports.cartItemSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        skuId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});
