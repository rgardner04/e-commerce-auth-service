const user = require("../models/user");
const userStatusEnum = require("../enums/userStatusEnum");

async function createUser({ email, hashedPassword, firstName, lastName }) {
  await user.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    status: userStatusEnum.PENDING,
  });
}

async function findUserById(userId) {
  const user = await user.findById(userId);

  if (!user) {
    throw new Error(`User not found for ID: ${userId}`);
  }

  return user;
}

async function findUserByEmail(email) {
  const user = await user.findOne({ email: email });

  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  return user;
}

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
};
