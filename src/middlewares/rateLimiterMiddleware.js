const { RateLimiterRedis, RateLimiterRes } = require("rate-limiter-flexible");
const redisService = require("../services/redisService");

let limiters = null;

function initializeRateLimiters() {
  const redisClient = redisService.getRedisClient();
  if (!redisClient || !redisClient.isReady) {
    console.log("Failed to initialize rate limiters. Redis is not ready.");
    return null;
  }

  if (limiters) {
    return limiters;
  }

  try {
    limiters = {
      perMinute: {
        name: "perMinute",
        limiter: new RateLimiterRedis({
          storeClient: redisClient,
          useRedisPackage: true,
          points: 10,
          duration: 60,
          blockDuration: 30,
        }),
      },
      perHour: {
        name: "perHour",
        limiter: new RateLimiterRedis({
          storeClient: redisClient,
          useRedisPackage: true,
          points: 1000,
          duration: 3600,
          blockDuration: 1800,
        }),
      },
      perDay: {
        name: "perDay",
        limiter: new RateLimiterRedis({
          storeClient: redisClient,
          useRedisPackage: true,
          points: 2500,
          duration: 86400,
          blockDuration: 43200,
        }),
      },
    };

    return limiters;
  } catch (error) {
    console.log(`Failed to initialize rate limiters: ${error?.message}`);
    return null;
  }
}

async function rateLimiterMiddleware(req, res, next) {
  try {
    const limiters = initializeRateLimiters();
    const { perMinute, perHour, perDay } = limiters;

    if (!perMinute || !perHour || !perDay) {
      console.log("Rate limiters not initialized. Bypassing rate limiting.");
      next();
      return;
    }

    const ipAddress = req.ip;
    if (!ipAddress) {
      return res.status(400).send({
        message: "Invalid request. Missing IP Address.",
        path: req.originalUrl,
        timestamp: new Date(),
        status: "failure",
      });
    }

    let consumedLimiters = [];
    try {
      await perMinute.limiter.consume(ipAddress);
      consumedLimiters.push(perMinute);

      await perHour.limiter.consume(ipAddress);
      consumedLimiters.push(perHour);

      await perDay.limiter.consume(ipAddress);
      consumedLimiters.push(perDay);
    } catch (error) {
      consumedLimiters.forEach((l) => {
        try {
          l.reward(1);
        } catch (error) {
          console.log(
            `Failed to reward back point for consumed limiter ${l.name}`,
          );
        }
      });
      throw error;
    }
    next();
  } catch (error) {
    if ((!error) instanceof RateLimiterRes) {
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
}

module.exports = rateLimiterMiddleware;
