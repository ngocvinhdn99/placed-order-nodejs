const Joi = require("joi");

const deliverySchema = Joi.object({
  name: Joi.string().required(),
  status: Joi.string().required(),
  regionPrices: Joi.array()
    .items(
      Joi.object({
        regionDistance: Joi.number().required(),
        price: Joi.number().required(),
      })
    )
    .required(),
});

module.exports = deliverySchema;
