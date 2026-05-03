const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const emailService = require("./emailService");
const jwtService = require("./jwtService");
const userRoleEnum = require("../enums/userRoleEnum");
const userStatusEnum = require("../enums/userStatusEnum");
const authStageEnum = require("../enums/authStageEnum");
const loggerService = require("./loggerService");
const CustomError = require("../utils/CustomError");

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
      message: `Registered user as ${userStatusEnum.PENDING}. Please validate your email to access your account.`,
      status: "success",
    },
  };
}

async function verifyEmail(requestBody) {
  const { verificationCode, email } = requestBody;

  logger.info({ verificationCode, email }, "Attempting to verify email.");

  const user = await emailService.verifyEmail(verificationCode, email);

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
      message: `Verified user email.`,
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

  try {
    logger.info(
      { email, hasPassword: !!password },
      "Attempting to login user.",
    );

    const user = await userModel.findOne({ email });

    if (!user) {
      logger.warn(
        { email, foundUser: !!user },
        "Could not find user with email.",
      );
      throw new CustomError(`Couldn't find user with email: ${email}`, 404);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn(
        { userId: user._id.toString(), hasPassword: !!password },
        "Invalid password provided.",
      );
      throw new CustomError("Invalid password provided.", 401);
    }

    await emailService.sendVerificationEmail(email, authStageEnum.LOGIN);

    return {
      status: 200,
      body: {
        message:
          "If an account exists for this email, a verification code has been sent.",
        status: "success",
      },
    };
  } catch (error) {
    logger.error(
      { error, email, hasPassword: !!password },
      "An error occured while attempting to login the user.",
    );
    return {
      status: 200,
      body: {
        message:
          "If an account exists for this email, a verification code has been sent.",
        status: "success",
      },
    };
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
};
