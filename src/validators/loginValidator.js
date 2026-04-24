const joi = require("joi");

const loginSchema = joi.object({
  body: joi
    .object({
      email: joi.string().required(),
      password: joi.string().required(),
    })
    .required(),
});

module.exports = loginSchema;
