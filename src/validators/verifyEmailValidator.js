const joi = require("joi");

const verifyEmailSchema = joi.object({
  body: joi
    .object({
      verificationCode: joi.number().required(),
    })
    .required(),
});

module.exports = verifyEmailSchema;
