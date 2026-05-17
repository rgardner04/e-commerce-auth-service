const errorTypeEnum = require("../enums/errorTypeEnum");

class CustomError extends Error {
  constructor(message, status, type = errorTypeEnum.DEFAULT_ERROR) {
    super(message);

    this.status = status;
    this.type = type;
    this.name = this.constructor.name;
  }
}

module.exports = CustomError;
