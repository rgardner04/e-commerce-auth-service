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

module.exports = {
  createUser,
};
