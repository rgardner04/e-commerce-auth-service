const queueEnum = require("../enums/queueEnum");
const eventEnum = require("../enums/eventEnum");
const getRabbitMq = require("../services/publisherService");

async function sendVerificationEmailEvent(email) {
  const { channel } = await getRabbitMq();

  if (!channel) {
    console.log(
      "RabbitMQ channel not initialized in sendVerificationEmailEvent",
    );
    return;
  }

  try {
    await channel.assertQueue(queueEnum.VERIFICATION_QUEUE, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
      },
    });

    const sendVerificationEmailEvent = getVerificationEmailEvent(email);
    channel.sendToQueue(
      queueEnum.VERIFICATION_QUEUE,
      Buffer.from(JSON.stringify(sendVerificationEmailEvent)),
    );
  } catch (error) {
    console.log(`Error sending verification email event: ${error?.message}`);
  }
}

function getVerificationEmailEvent(email) {
  return {
    event: eventEnum.SEND_VERIFICATION_EMAIL,
    data: {
      email: email,
    },
  };
}

module.exports = {
  sendVerificationEmailEvent,
};
