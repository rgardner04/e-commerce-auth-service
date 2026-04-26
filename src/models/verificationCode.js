const mongoose = require("mongoose");

const verificationCode = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: [
      true,
      "A valid user ID is required when creating a verification code.",
    ],
    index: true,
  },
  verificationCode: {
    type: Number,
    required: [
      true,
      "A valid verification code value is required when creating a verification code.",
    ],
    index: true,
  },
  expiresAt: {
    type: Date,
    required: [
      true,
      "A valid expiration date is required when creating a verification code.",
    ],
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "EXPIRED", "VALIDATED", "INVALIDATED"],
      message: "{VALUE} is not a valid verification code status.",
    },
    required: [
      true,
      "A valid status is required when creating a verification code.",
    ],
  },
});

module.exports = mongoose.model("verificationCode", verificationCode);
