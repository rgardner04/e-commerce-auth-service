const userService = require("./userService");
const verificationCode = require("../models/verificationCode");
const verificationCodeStatusEnum = require("../enums/verificationCodeStatusEnum");
const queueEnum = require("../enums/queueEnum");
const eventEnum = require("../enums/eventEnum");
const publisherService = require("./publisherService");

async function sendVerificationEmailEvent(email) {
  const { channel } = await publisherService.getRabbitMq();

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

async function verifyEmail(code) {
  const verificationCodeObj = await verificationCode
    .findOne({ verificationCode: code, status: verificationCodeStatusEnum.PENDING })
    .lean();

  if (!verificationCodeObj) {
    throw new Error(`Verification code not found for code: ${code}`);
  }

  const user = await userService.findUserById(verificationCodeObj.userId);

  if (!user) {
    throw new Error(
      `User not found from user ID ${verificationCodeObj.userId.toString()} for the verification code ${code}. `,
    );
  }

  const currentTime = new Date().getTime();
  if (currentTime > verificationCodeObj.expiresAt) {
    throw new Error(
      "Verification code is expired. Please request a new verification code.",
    );
  }

  if (!code === verificationCodeObj.verificationCode) {
    throw new Error("Invalid verification code provided. Please try again");
  }

  await verificationCode.updateOne(
    { verificationCode: code, userId: user._id },
    { $set: { status: verificationCodeStatusEnum.VALIDATED } },
  );

  return user._id;
}

module.exports = {
  sendVerificationEmailEvent,
  verifyEmail,
};
