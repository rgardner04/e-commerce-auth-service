function errorMiddleware(error, req, res, next) {
  if (!error) {
    next();
    return;
  }

  return res.status(500).send({
    message: error?.message || "An internal server error occurred.",
    status: "failure",
    path: req.originalUrl,
    timestamp: new Date(),
  });
}

module.exports = errorMiddleware;
