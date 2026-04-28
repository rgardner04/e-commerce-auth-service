const userModel = require("../models/user");
const userStatusEnum = require("../enums/userStatusEnum");

async function createUser({ email, hashedPassword, firstName, lastName, role }) {
  await userModel.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: role,
    status: userStatusEnum.PENDING,
  });
}

async function findUserById(userId) {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error(`User not found for ID: ${userId}`);
  }

  return user;
}

async function findUserByEmail(email) {
  const user = await userModel.findOne({ email: email });

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
