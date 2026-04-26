const queueEnum = require("../enums/queueEnum");
const eventEnum = require("../enums/eventEnum");
const getRabbitMq = require("./publisherService");

async function sendVerificationEmailEvent(email) {
  const { channel } = await getRabbitMq();

  if (!channel) {
    console.log(
      "RabbitMQ channel not initialized in sendVerificationEmailEvent",
    );
    return;
  }

  try {
    await channel.assertQueue(queueEnum.EMAIL_VERIFICATION_QUEUE, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
      },
    });

    channel.sendToQueue(
      queueEnum.EMAIL_VERIFICATION_QUEUE,
      Buffer.from(
        JSON.stringify({
          type: eventEnum.SEND_VERIFICATION_EMAIL,
          data: {
            email: email,
          },
          timestamp: new Date(),
        }),
      ),
    );
  } catch (error) {
    console.log(`Error sending verification email event: ${error?.message}`);
  }
}

module.exports = {
  sendVerificationEmailEvent,
};
