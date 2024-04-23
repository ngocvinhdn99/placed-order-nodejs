const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
});

module.exports = userSchema;
