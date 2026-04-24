const jwt = require("jsonwebtoken");
const {
  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} = process.env;

function getPrivateKey() {
  return JWT_PRIVATE_KEY?.replaceAll("\\n", "\n");
}

function getPublicKey() {
  return JWT_PUBLIC_KEY?.replaceAll("\\n", "\n");
}

function generateAccessToken() {}

function generateRefreshToken() {}
