const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const emailService = require("./emailService");
const jwtService = require("./jwtService");
const userRoleEnum = require("../enums/userRoleEnum");
const userStatusEnum = require("../enums/userStatusEnum");
const authStageEnum = require("../enums/authStageEnum");
const loggerService = require("./loggerService");
const CustomError = require("../utils/CustomError");
const { VERIFICATION_CODE_LENGTH, REFRESH_TOKEN_EXPIRY_SECONDS } = process.env;

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

function getRegister() {
  logger.info("Attempting to get register data for display.");

  return {
    status: 200,
    body: {
      message: "Register data retrieved.",
      status: "success",
      data: {
        registerFormMainHeader: "Create an account",
        registerFormSubHeader: "Fill in your details to get started",
        inputFields: {
          firstName: {
            label: "First name",
            placeholder: "Enter your first name",
            type: "text",
            required: true,
          },
          lastName: {
            label: "Last name",
            placeholder: "Enter your last name",
            type: "text",
            required: true,
          },
          email: {
            label: "Email",
            placeholder: "Enter your email",
            type: "email",
            required: true,
          },
          password: {
            label: "Password",
            placeholder: "Enter a strong password",
            type: "password",
            required: true,
          },
        },
        registerFormButtonText: "Sign up",
      },
    },
  };
}

async function verifyEmail(requestBody, res) {
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

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/api/auth/refresh",
    maxAge: parseInt(REFRESH_TOKEN_EXPIRY_SECONDS) * 1000,
  });

  return {
    status: 200,
    body: {
      message: `Verified user email.`,
      data: {
        accessToken,
      },
      status: "success",
    },
  };
}

function getVerifyEmail() {
  logger.info("Attempting to get verify email data for display.");

  return {
    status: 200,
    body: {
      message: "Verify email data retrieved.",
      status: "success",
      data: {
        emailVerificationFormMainHeader: "Verify your email",
        emailVerificationFormSubHeader: "An email has been sent to ",
        inputFields: {
          verificationCode: {
            type: "text",
            verificationCodeLength: parseInt(VERIFICATION_CODE_LENGTH),
            required: true,
          },
        },
        emailVerificationFormButtonText: "Verify",
      },
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

function getLogin() {
  logger.info("Attempting to get login data for display.");

  return {
    status: 200,
    body: {
      message: "Login data retrieved.",
      status: "success",
      data: {
        loginFormMainHeader: "Welcome back",
        loginFormSubHeader: "Enter your credentials to continue",
        inputFields: {
          email: {
            label: "Email",
            placeholder: "Enter your email",
            type: "email",
            required: true,
          },
          password: {
            label: "Password",
            placeholder: "Enter your password",
            type: "password",
            required: true,
          },
        },
        loginFormButtonText: "Sign in",
      },
    },
  };
}

module.exports = {
  register,
  getRegister,
  verifyEmail,
  getVerifyEmail,
  login,
  getLogin,
};
