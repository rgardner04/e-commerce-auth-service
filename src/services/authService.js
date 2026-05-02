const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const emailService = require("./emailService");
const jwtService = require("./jwtService");
const userRoleEnum = require("../enums/userRoleEnum");
const userStatusEnum = require("../enums/userStatusEnum");
const authStageEnum = require("../enums/authStageEnum");
const loggerService = require("./loggerService");

const logger = loggerService.getLogger();

async function register(requestBody) {
  const { email, password, firstName, lastName } = requestBody;

  logger.info(
    { email, hasPassword: !!password, firstName, lastName },
    "Attempting to register user.",
  );

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await userModel.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: userRoleEnum.USER,
    status: userStatusEnum.PENDING,
  });

  logger.info({ userId: createdUser._id.toString() }, "Created new user.");

  await emailService.sendVerificationEmail(email, authStageEnum.REGISTER);

  return {
    status: 201,
    body: {
      message: `User registered as ${userStatusEnum.PENDING}. Please validate your email to access your account.`,
      status: "success",
    },
  };
}

async function verifyEmail(requestBody) {
  const { verificationCode } = requestBody;

  logger.info({ verificationCode }, "Attempting to verify email.");

  const user = await emailService.verifyEmail(verificationCode);

  if (user.status !== userStatusEnum.EMAIL_VERIFIED) {
    const updatedUser = await userModel.findByIdAndUpdate(user._id, {
      $set: { status: userStatusEnum.EMAIL_VERIFIED },
    });

    logger.info(
      { userId: updatedUser._id.toString(), previousStatus: user.status },
      "User was previosly not verified.",
    );
  }

  const { accessToken, refreshToken } = await jwtService.generateTokens(user);

  return {
    status: 200,
    body: {
      message: `User email verified.`,
      data: {
        accessToken,
        refreshToken,
      },
      status: "success",
    },
  };
}

async function login(requestBody) {
  const { email, password } = requestBody;

  logger.info({ email, hasPassword: !!password }, "Attempting to login user.");

  const user = await userModel.findOne({ email });

  if (!user) {
    logger.warn(
      { email, foundUser: !!user },
      "Could not find user with email.",
    );
    throw new Error(`Couldn't find user with email: ${email}`);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    logger.warn(
      { userId: user._id.toString(), hasPassword: !!password },
      "Invalid password provided.",
    );
    throw new Error("Invalid password provided.");
  }

  await emailService.sendVerificationEmail(email, authStageEnum.LOGIN);

  return {
    status: 200,
    body: {
      message:
        "User credentials verified. Please validate your email to access your account.",
      status: "success",
    },
  };
}

module.exports = {
  register,
  verifyEmail,
  login,
};
