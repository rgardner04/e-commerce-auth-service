const { createClient } = require("redis");
const { REDIS_URL } = process.env;

let redisClient = createClient({ url: REDIS_URL });

async function connectToRedis(redisClient) {
  try {
    await redisClient.connect();
    console.log("Successfully connected to Redis.");
  } catch (error) {
    console.log(`Error connecting to Redis: ${error?.message}`);
  }
}

module.exports = {
  redisClient,
  connectToRedis,
};
