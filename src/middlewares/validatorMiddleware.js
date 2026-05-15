function validatorMiddleware(validationSchema) {
  return function (req, res, next) {
    // 1. Pass a plain object to Joi instead of the raw 'req' instance
    const { error, value } = validationSchema.validate(
      {
        query: req.query,
        body: req.body,
        params: req.params,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    if (error) {
      return res.status(400).send({
        message: error?.message || "Validation failed.",
        path: req.originalUrl,
        timestamp: new Date(),
        status: "failure",
      });
    }

    // 2. Reassign the properties safely (or just the query if that's all you need)
    if (value.query) req.query = value.query;
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;

    next();
  };
}

module.exports = validatorMiddleware;
