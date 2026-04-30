const { createClient } = require("redis");
const { REDIS_URL } = process.env;

let redisClient = null;

function getRedisClient() {
  try {
    if (redisClient) {
      return redisClient;
    }
    redisClient = createClient({ url: REDIS_URL });
    return redisClient;
  } catch (error) {
    console.error(
      `Could not initialize Redis client. Error: ${error instanceof Error ? error?.message : ''}`,
    );
    return null;
  }
}

async function initializeRedis() {
  try {
    if (!redisClient) {
      getRedisClient();
    }
    await redisClient.connect();
    console.log("Successfully connected to Redis.");
  } catch (error) {
    console.log(`Error connecting to Redis: ${error?.message}`);
  }
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
        `Connection to Redis attempt ${attempts + 1} failed. Error: ${error instanceof Error ? error?.message : ''}`,
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
