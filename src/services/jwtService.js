const jwt = require("jsonwebtoken");
const refreshTokenModel = require("../models/refreshToken");
const {
  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
  AUTH_SERVICE_URL,
} = process.env;
const userRoleEnum = require("../enums/userRoleEnum");
const refreshTokenStatusEnum = require("../enums/refreshTokenStatusEnum");
const loggerService = require("./loggerService");

const logger = loggerService.getLogger();

function getPrivateKey() {
  if (!JWT_PRIVATE_KEY) {
    throw new Error("JWT private key not configured.");
  }
  return JWT_PRIVATE_KEY.replaceAll("\\n", "\n");
}

function getPublicKey() {
  if (!JWT_PUBLIC_KEY) {
    throw new Error("JWT public key not configured.");
  }
  return JWT_PUBLIC_KEY.replaceAll("\\n", "\n");
}

function generateAccessToken(user) {
  const accessToken = jwt.sign(
    {
      iss: AUTH_SERVICE_URL,
      sub: user._id.toString(),
      aud: AUTH_SERVICE_URL,
    },
    getPrivateKey(),
    {
      expiresIn: `${ACCESS_TOKEN_EXPIRY_SECONDS}s`,
      algorithm: "RS256",
    },
  );

  logger.info({ userId: user._id.toString() }, "Generated access token.");

  return accessToken;
}

async function revokePreviousRefreshTokens(userId, refreshToken) {
  const previousRefreshTokens = await refreshTokenModel.find({
    userId: userId,
    refreshToken: { $ne: refreshToken },
    status: refreshTokenStatusEnum.CREATED,
  });

  if (!previousRefreshTokens) {
    return;
  }

  const previousRefreshTokenIds = previousRefreshTokens.map((r) => r._id);

  logger.info(
    { userId, previousRefreshTokenIds },
    "Revoking previous refresh tokens.",
  );

  const updateResult = await refreshTokenModel.updateMany(
    { _id: { $in: previousRefreshTokenIds } },
    { $set: { status: refreshTokenStatusEnum.REVOKED } },
  );

  logger.info(
    { revokedCount: updateResult.modifiedCount },
    "Revoked previous refresh tokens.",
  );
}

async function generateRefreshToken(user) {
  const refreshToken = jwt.sign(
    {
      iss: AUTH_SERVICE_URL,
      sub: user._id.toString(),
      aud: AUTH_SERVICE_URL,
      role: user.role || userRoleEnum.USER,
    },
    getPrivateKey(),
    {
      expiresIn: `${REFRESH_TOKEN_EXPIRY_SECONDS}s`,
      algorithm: "RS256",
    },
  );

  await Promise.all([
    await refreshTokenModel.create({
      userId: user._id,
      refreshToken: refreshToken,
      status: refreshTokenStatusEnum.CREATED,
    }),
    await revokePreviousRefreshTokens(user._id, refreshToken),
  ]);

  logger.info({ userId: user._id.toString() }, "Created refresh token.");

  return refreshToken;
}

async function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  logger.info(
    { userId: user._id.toString() },
    "Generated access and refresh tokens.",
  );

  return { accessToken, refreshToken };
}

module.exports = {
  generateTokens,
};
