const mongoose = require("mongoose");
const refreshTokenStatusEnum = require("../enums/refreshTokenStatusEnum");

const refreshToken = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: [
      true,
      "A valid user ID is required when creating a refresh token.",
    ],
    index: true,
  },
  refreshToken: {
    type: String,
    required: [
      true,
      "A valid refresh token is required when creating a refresh token.",
    ],
    index: true,
    unique: true,
  },
  status: {
    type: String,
    required: [
      true,
      "A valid status is required when creating a refresh token.",
    ],
    enum: {
      values: Object.values(refreshTokenStatusEnum),
      message: "{VALUE} is not a valid refresh token status.",
    },
  },
});

module.exports = mongoose.model("refreshToken", refreshToken);
