const amqp = require("amqplib");
const { RABBIT_MQ_URL } = process.env;
const loggerService = require("./loggerService");

const logger = loggerService.getLogger();

let connection = null;
let channel = null;

async function getRabbitMqConnection() {
  if (connection) return connection;

  connection = await amqp.connect(RABBIT_MQ_URL);
  logger.info("RabbitMQ connection initialized.");
}

async function getRabbitMqChannel() {
  if (channel) return channel;

  channel = await connection.createChannel();
  logger.info("RabbitMQ channel initialized.");
}

async function initializeRabbitMq() {
  await getRabbitMqConnection();
  await getRabbitMqChannel();

  logger.info(`Connected to RabbitMQ at ${RABBIT_MQ_URL}`);
  connection.on("close", () => {
    connection = null;
    channel = null;
  });
}

async function connectWithRetry() {
  const maxAttempts = 5;
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      await initializeRabbitMq();
      return;
    } catch (error) {
      console.warn(
        `Connection to RabbitMQ attempt ${attempts + 1} failed. Error: ${error instanceof Error ? error?.message : ""}`,
      );
      attempts++;

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  console.error("Could not connect to RabbitMQ after maximum attempts.");
}

async function onModuleInit() {
  await connectWithRetry();
}

(async () => {
  await onModuleInit();
})();

module.exports = {
  getRabbitMqChannel,
};
