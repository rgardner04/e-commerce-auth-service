const userModel = require("../models/user");
const verificationCodeModel = require("../models/verificationCode");
const verificationCodeStatusEnum = require("../enums/verificationCodeStatusEnum");
const queueEnum = require("../enums/queueEnum");
const eventEnum = require("../enums/eventEnum");
const rabbitMqService = require("./rabbitMqService");
const loggerService = require("./loggerService");

const logger = loggerService.getLogger();

async function sendVerificationEmail(email, authStage) {
  try {
    const channel = await rabbitMqService.getRabbitMqChannel();

    await channel.assertQueue(queueEnum.EMAIL_VERIFICATION_QUEUE, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
      },
    });

    const emailVerificationEvent = {
      type: eventEnum.SEND_VERIFICATION_EMAIL,
      data: {
        email,
        authStage,
      },
      timestamp: new Date(),
    };

    logger.info(
      emailVerificationEvent,
      "Preparing to send email verification event.",
    );

    channel.sendToQueue(
      queueEnum.EMAIL_VERIFICATION_QUEUE,
      Buffer.from(JSON.stringify(emailVerificationEvent)),
    );
  } catch (error) {
    logger.error(
      error,
      `Couldn't send ${eventEnum.SEND_VERIFICATION_EMAIL} event.`,
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
    logger.warn(
      { verificationCode, foundVerificationCode: !!verificationCodeObj },
      "Could not find verification code document.",
    );
    throw new Error("Invalid verification code provided.");
  }

  logger.info(
    {
      verificationCodeId: verificationCodeObj._id.toString(),
      verificationCode,
    },
    "Found verification code document.",
  );

  const user = await userModel.findById(verificationCodeObj.userId);

  logger.info(
    { userId: user._id.toString(), verificationCode },
    "Found user associated with verification code.",
  );

  if (!user) {
    logger.warn(
      {
        verificationCode,
        foundUser: !!user,
        verificationCodeUserId: verificationCodeObj.userId,
      },
      "Could not find user document from user ID in verification code",
    );
    throw new Error(`User not found for provided verification code.`);
  }

  const currentTime = new Date().getTime();
  const expiresAt = new Date(verificationCodeObj.expiresAt).getTime();

  if (currentTime > expiresAt) {
    logger.warn(
      { currentTime, expiresAt, verificationCode: verificationCode },
      "The provided verification code is expired.",
    );
    throw new Error("The provided verification code is expired.");
  }

  if (verificationCode !== verificationCodeObj.verificationCode) {
    logger.warn(
      {
        verificationCode,
        correctVerificationCode: verificationCodeObj.verificationCode,
      },
      "Invalid verification code provided.",
    );
    throw new Error("Invalid verification code provided.");
  }

  const updatedVerificationCode = await verificationCodeModel.findOneAndUpdate(
    { verificationCode: verificationCode, userId: user._id },
    { $set: { status: verificationCodeStatusEnum.VALIDATED } },
  );

  logger.info(
    { verificationCodeId: updatedVerificationCode._id.toString() },
    `Updated verification code status to ${verificationCodeStatusEnum.VALIDATED}`,
  );

  return user;
}

module.exports = {
  sendVerificationEmail,
  verifyEmail,
};
