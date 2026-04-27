const passwordService = require("./passwordService");
const userService = require("./userService");
const emailVerificationService = require("./emailVerificationService");
const jwtService = require("./jwtService");
const userRoleEnum = require('../enums/userRoleEnum')

async function register(requestBody) {
  const { email, password, firstName, lastName } = requestBody;

  const hashedPassword = await passwordService.generateHashedPassword(password);

  await userService.createUser({
    email,
    hashedPassword,
    firstName,
    lastName,
    role: userRoleEnum.USER,
  });

  await emailVerificationService.sendVerificationEmailEvent(email);

  return {
    status: 201,
    body: {
      message:
        "User registered successfully. Please validate your email to finish registering.",
      status: "success",
    },
  };
}

async function verifyEmail(requestBody) {
  const { verificationCode } = requestBody;

  const userId = await emailVerificationService.verifyEmail(verificationCode);

  const user = await userService.findUserById(userId);

  const { accessToken, refreshToken } = await jwtService.generateTokens(user);

  return {
    status: 200,
    body: {
      message: "Email verified successfully.",
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

  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw new Error(`Failed to find account with email: ${email}`);
  }

  await passwordService.validatePassword(password, user.password);

  return {
    status: 200,
    body: {
      message:
        "Correct credentials provided. Please validate your email to finish logging in.",
      status: "success",
    },
  };
}

module.exports = {
  register,
  verifyEmail,
  login,
};
