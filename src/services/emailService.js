const userModel = require("../models/user");
const verificationCodeModel = require("../models/verificationCode");
const verificationCodeStatusEnum = require("../enums/verificationCodeStatusEnum");
const queueEnum = require("../enums/queueEnum");
const eventEnum = require("../enums/eventEnum");
const rabbitMqService = require("./rabbitMqService");
const loggerService = require("./loggerService");
const CustomError = require("../utils/CustomError");

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

async function verifyEmail(verificationCode, email) {
  const user = await userModel.findOne({ email });

  if (!user) {
    logger.warn(
      { email, verificationCode },
      "Could not find user from email for verification code.",
    );
    throw new CustomError("Invalid email provided for verification code.", 401);
  }

  logger.info(
    { userId: user._id.toString(), email: user.email, verificationCode },
    "Found user associated with email.",
  );

  const verificationCodeObj = await verificationCodeModel
    .findOne({
      verificationCode: verificationCode,
      userId: user._id,
      status: verificationCodeStatusEnum.PENDING,
    })
    .lean();

  if (!verificationCodeObj) {
    logger.warn(
      {
        verificationCode,
        foundVerificationCode: !!verificationCodeObj,
        userId: user._id,
      },
      "Could not find verification code document.",
    );
    throw new CustomError("Invalid verification code provided.", 401);
  }

  logger.info(
    {
      verificationCodeId: verificationCodeObj._id.toString(),
      verificationCode,
    },
    "Found verification code document.",
  );

  const currentTime = new Date().getTime();
  const expiresAt = new Date(verificationCodeObj.expiresAt).getTime();

  if (currentTime > expiresAt) {
    logger.warn(
      { currentTime, expiresAt, verificationCode: verificationCode },
      "The provided verification code is expired.",
    );
    throw new CustomError("The provided verification code is expired.", 401);
  }

  if (verificationCode !== verificationCodeObj.verificationCode) {
    logger.warn(
      {
        verificationCode,
        correctVerificationCode: verificationCodeObj.verificationCode,
      },
      "Invalid verification code provided.",
    );
    throw new CustomError("Invalid verification code provided.", 401);
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
