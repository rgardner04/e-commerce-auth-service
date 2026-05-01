const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const emailService = require("./emailService");
const jwtService = require("./jwtService");
const userRoleEnum = require("../enums/userRoleEnum");
const userStatusEnum = require("../enums/userStatusEnum");
const authStageEnum = require("../enums/authStageEnum");

async function register(requestBody) {
  const { email, password, firstName, lastName } = requestBody;

  const hashedPassword = await bcrypt.hash(password, 10);

  await userModel.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: userRoleEnum.USER,
    status: userStatusEnum.PENDING,
  });

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

  const user = await emailService.verifyEmail(verificationCode);

  if (user.status !== userStatusEnum.EMAIL_VERIFIED) {
    await userModel.findByIdAndUpdate(user._id, {
      $set: { status: userStatusEnum.EMAIL_VERIFIED },
    });
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

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new Error(`Couldn't find user with email: ${email}`);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
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
