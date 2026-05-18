const { createClient } = require("redis");
const { REDIS_URL } = process.env;
const loggerService = require("./loggerService");

const logger = loggerService.getLogger();

let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  redisClient = createClient({ url: REDIS_URL });
}

async function initializeRedis() {
  if (!redisClient) {
    getRedisClient();
  }
  await redisClient.connect();

  logger.info(`Connected to Redis at ${REDIS_URL}`);
}

async function connectWithRetry() {
  const maxAttempts = 5;
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      await initializeRedis();
      return;
    } catch (error) {
      console.warn(
        `Connection to Redis attempt ${attempts + 1} failed. Error: ${error instanceof Error ? error?.message : ""}`,
      );
      attempts++;

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  console.error("Could not connect to Redis after maximum attempts.");
}

async function onModuleInit() {
  await connectWithRetry();
}

(async () => {
  await onModuleInit();
})();

module.exports = {
  getRedisClient,
};
