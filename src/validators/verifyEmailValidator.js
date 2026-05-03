const joi = require("joi");

const verifyEmailSchema = joi.object({
  body: joi
    .object({
      email: joi.string().required(),
      verificationCode: joi.number().required(),
    })
    .required(),
});

module.exports = verifyEmailSchema;
