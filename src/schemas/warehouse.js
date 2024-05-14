const Joi = require("joi");

exports.warehouseItemSchema = Joi.array()
  .items(
    Joi.object({
      skuId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  )
  .min(1)
  .required();

exports.warehouseSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      skuId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ),
  name: Joi.string().required(),
  address: Joi.string().required(),
  regionCode: Joi.number().required(),
});
