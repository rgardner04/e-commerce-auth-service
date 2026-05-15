const joi = require("joi");
const adminRegisterRequestEnum = require("../enums/adminRegisterRequestEnum");

const adminRegisterRequestsSchema = joi.object({
  query: joi.object({
    status: joi
      .string()
      .allow(adminRegisterRequestEnum.PENDING)
      .allow(adminRegisterRequestEnum.ACCEPTED)
      .allow(adminRegisterRequestEnum.REJECTED),
    page: joi.number().default(1),
    limit: joi.number().default(10),
  }),
});

module.exports = adminRegisterRequestsSchema;
