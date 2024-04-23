const Joi = require("joi");

const checkoutSchema = Joi.object({
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

module.exports = checkoutSchema;
