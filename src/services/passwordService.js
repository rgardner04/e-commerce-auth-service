const bcrypt = require("bcrypt");

async function generateHashedPassword(plaintextPassword) {
  const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
  return hashedPassword;
}

async function validatePassword(plaintextPassword, storedPassword) {
  return await bcrypt.compare(plaintextPassword, storedPassword);
}

module.exports = {
  generateHashedPassword,
  validatePassword,
};
