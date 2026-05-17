const errorTypeEnum = require("../enums/errorTypeEnum");

function shouldShowErrorMessage(error) {
  switch (error.type) {
    case errorTypeEnum.INVALID_CREDENTIALS:
    case errorTypeEnum.USER_NOT_FOUND:
      return false;
    case errorTypeEnum.DEFAULT_ERROR:
    case errorTypeEnum.INVALID_ROLE:
      return true;
    default:
      return false;
  }
}

module.exports = shouldShowErrorMessage;
