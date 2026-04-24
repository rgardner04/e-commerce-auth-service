const bcrypt = require("bcrypt");

async function generateHashedPassword(plaintextPassword) {
  const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
  return hashedPassword;
}

module.exports = {
  generateHashedPassword,
};
