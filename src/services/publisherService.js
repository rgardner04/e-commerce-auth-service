const amqp = require("amqplib");
const { RABBIT_MQ_URL } = process.env;

let connection = null;
let channel = null;

async function getRabbitMq() {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    connection = await amqp.connect(RABBIT_MQ_URL);
    channel = await connection.createChannel();

    console.log("Successfully connected to RabbitMQ");

    connection.on("close", () => {
      connection = null;
      channel = null;
    });

    return { connection, channel };
  } catch (error) {
    console.log(`Failed to connect to RabbitMQ: ${error?.message}`);
    throw error;
  }
}

module.exports = getRabbitMq;
