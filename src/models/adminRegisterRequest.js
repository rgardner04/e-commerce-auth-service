const mongoose = require("mongoose");
const adminRegisterRequestEnum = require("../enums/adminRegisterRequestEnum");

const adminRegisterRequest = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: [
        true,
        "A valid user ID is required when creating an admin register request.",
      ],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(adminRegisterRequestEnum),
        message: "{VALUE} is not a valid admin register request status.",
      },
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("adminRegisterRequest", adminRegisterRequest);
