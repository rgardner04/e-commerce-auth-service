function validatorMiddleware(validationSchema) {
  return function (req, res, next) {
    const { error, _value } = validationSchema.validate(req, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).send({
        message: error?.message || "Validation failed.",
        path: req.originalUrl,
        timestamp: new Date(),
        status: "failure",
      });
    }

    next();
  };
}

module.exports = validatorMiddleware;
