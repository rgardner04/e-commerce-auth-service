const errorTypeEnum = require("../enums/errorTypeEnum");

function shouldShowErrorMessage(error) {
  let showErrorMessage = false;
  switch (error.type) {
    case errorTypeEnum.INVALID_CREDENTIALS:
    case errorTypeEnum.USER_NOT_FOUND:
      showErrorMessage = false;
      break;
    case errorTypeEnum.DEFAULT_ERROR:
    case errorTypeEnum.INVALIDE_ROLE:
      showErrorMessage = true;
      break;
  }
}

module.exports = shouldShowErrorMessage;
