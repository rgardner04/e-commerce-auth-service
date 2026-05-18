const { RateLimiterRes } = require("rate-limiter-flexible");

function newRateLimiterMiddleware(customRateLimiter) {
  return async function (req, res, next) {
    try {
      const rateLimiter = await customRateLimiter.getRateLimiter();
      const ipAddress = req.ip;

      if (!ipAddress) {
        return res.status(400).send({
          message: "Invalid request. Missing IP Address.",
          path: req.originalUrl,
          timestamp: new Date(),
          status: "failure",
        });
      }

      await rateLimiter.consume(ipAddress);

      next();
    } catch (error) {
      if (!(error instanceof RateLimiterRes)) {
        return res.status(500).send({
          message: `An internal server error occurred: ${error?.message}`,
          path: req.originalUrl,
          timestamp: new Date(),
          status: "failure",
        });
      }
      return res.status(429).send({
        message: `Too many requests. Please try again in ${error?.msBeforeNext / 1000} seconds`,
        path: req.originalUrl,
        timestamp: new Date(),
        status: "failure",
      });
    }
  };
}

module.exports = newRateLimiterMiddleware;
