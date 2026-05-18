const loggerService = require("../services/loggerService");
const { RateLimiterRedis, RateLimiterRes } = require("rate-limiter-flexible");
const redisService = require("../services/redisService");

const logger = loggerService.getLogger();

class CustomRateLimiter {
  constructor(name, points, duration, blockDuration) {
    this.name = name;
    this.points = points;
    this.duration = duration;
    this.blockDuration = blockDuration;
    this.rateLimiter = null;
  }

  async getRateLimiter() {
    if (this.rateLimiter && this.rateLimiter instanceof RateLimiterRedis) {
      return this.rateLimiter;
    }

    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      if (this.rateLimiter && this.rateLimiter instanceof RateLimiterRedis) {
        return this.rateLimiter;
      }

      const redisClient = redisService.getRedisClient();

      if (!redisClient || !redisClient.isReady) {
        logger.warn(
          `Rate limiter initialization attempt ${attempts + 1} failed. Redis client is not ready.`,
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } else {
        this.rateLimiter = new RateLimiterRedis({
          storeClient: redisClient,
          useRedisPackage: true,
          points: this.points,
          duration: this.duration,
          blockDuration: this.blockDuration,
        });
        logger.info({ name: this.name }, "Rate limiter initialized.");
      }
    }
  }
}

module.exports = CustomRateLimiter;
