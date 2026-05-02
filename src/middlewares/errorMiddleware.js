const loggerService = require("../services/loggerService");

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

  return res.status(500).send({
    message: error?.message || "An internal server error occurred.",
    status: "failure",
    path: req.originalUrl,
    timestamp: new Date(),
  });
}

module.exports = errorMiddleware;
