const passwordService = require("./passwordService");
const verificationEmailEventService = require("./verificationEmailEventService");
const userRepository = require("../repositories/userRepository");

async function register(requestBody) {
  const { email, password, firstName, lastName } = requestBody;

  const hashedPassword = await passwordService.generateHashedPassword(password);

  await userRepository.createUser({
    email,
    hashedPassword,
    firstName,
    lastName,
  });

  verificationEmailEventService.sendVerificationEmailEvent(email);

  return {
    status: 201,
    body: {
      message: "User registered successfully. Please validate email.",
      status: "success",
    },
  };
}

async function login(requestBody) {
  const { email, password } = requestBody;

  const userToLogin = await user.findOne({ email: email });

  if (!userToLogin) {
    throw new Error(`Failed to find account with email: ${email}`);
  }
}

module.exports = {
  register,
};
