const loggerService = require("../services/loggerService");
const CustomError = require("../utils/CustomError");

const logger = loggerService.getLogger();

function errorMiddleware(error, req, res, next) {
  if (!error) {
    next();
    return;
  }

  logger.error(
    error,
    "An error occured which is being handled in the errorMiddleware.",
  );

  if (error instanceof CustomError) {
    return res.status(error?.status || 500).send({
      message: error?.message || "An internal server error occured.",
      status: "failure",
      path: req.originalUrl,
      timestamp: new Date(),
    });
  }

  return res.status(500).send({
    message: error?.message || "An internal server error occurred.",
    status: "failure",
    path: req.originalUrl,
    timestamp: new Date(),
  });
}

module.exports = errorMiddleware;
