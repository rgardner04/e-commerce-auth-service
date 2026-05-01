const userModel = require("../models/user");
const verificationCodeModel = require("../models/verificationCode");
const verificationCodeStatusEnum = require("../enums/verificationCodeStatusEnum");
const queueEnum = require("../enums/queueEnum");
const eventEnum = require("../enums/eventEnum");
const rabbitMqService = require("./rabbitMqService");

async function sendVerificationEmail(email) {
  try {
    const channel = await rabbitMqService.getRabbitMqChannel();

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
    console.error(
      `Couldn't send verification email event to subscriber service. Error: ${error instanceof Error ? error?.message : ""}`,
    );
  }
}

async function verifyEmail(verificationCode) {
  const verificationCodeObj = await verificationCodeModel
    .findOne({
      verificationCode: verificationCode,
      status: verificationCodeStatusEnum.PENDING,
    })
    .lean();

  if (!verificationCodeObj) {
    throw new Error("Invalid verification code provided.");
  }

  const user = await userModel.findById(verificationCodeObj.userId);

  if (!user) {
    throw new Error(`User not found for provided verification code.`);
  }

  if (
    new Date().getTime() > new Date(verificationCodeObj.expiresAt).getTime()
  ) {
    throw new Error("The provided verification code is expired.");
  }

  if (verificationCode !== verificationCodeObj.verificationCode) {
    throw new Error("Invalid verification code provided.");
  }

  await verificationCode.updateOne(
    { verificationCode: code, userId: user._id },
    { $set: { status: verificationCodeStatusEnum.VALIDATED } },
  );

  return user;
}

module.exports = {
  sendVerificationEmail,
  verifyEmail,
};
