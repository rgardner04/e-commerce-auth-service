const amqp = require("amqplib");
const { RABBIT_MQ_URL } = process.env;

let connection = null;
let channel = null;

async function getRabbitMqConnection() {
  if (connection) return connection;
  try {
    connection = await amqp.connect(RABBIT_MQ_URL);
    return connection;
  } catch (error) {
    console.error(
      `Could not initialize RabbitMQ connection. Error: ${error instanceof Error ? error?.message : ""}`,
    );
    return null;
  }
}

async function getRabbitMqChannel() {
  if (channel) return channel;
  try {
    if (!connection) {
      await getRabbitMqConnection();
    }
    channel = await connection.createChannel();
    return channel;
  } catch (error) {
    console.error(
      `Could not initialize RabbitMQ channel. Error: ${error instanceof Error ? error?.message : ""}`,
    );
    return null;
  }
}

async function initializeRabbitMq() {
  try {
    if (!connection) {
      await getRabbitMqConnection();
    }
    if (!channel) {
      await getRabbitMqChannel();
    }

    console.log(`Connected to RabbitMQ at ${RABBIT_MQ_URL}`);

    connection.on("close", () => {
      connection = null;
      channel = null;
    });
  } catch (error) {
    console.log(`Failed to connect to RabbitMQ: ${error?.message}`);
    throw error;
  }
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
