const joi = require("joi");

const registerSchema = joi.object({
  body: joi
    .object({
      email: joi.string().required(),
      password: joi.string().required(),
      firstName: joi.string().required(),
      lastName: joi.string().required(),
    })
    .required(),
});

module.exports = registerSchema;
