const mongoose = require("mongoose");
const userStatusEnum = require("../enums/userStatusEnum");
const userRoleEnum = require("../enums/userRoleEnum");

const user = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide a valid email."],
    unique: [true, "The provided email is already in use."],
    index: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email.`,
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a valid password."],
  },
  firstName: {
    type: String,
    required: [true, "Please provide a valid first name."],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a valid last name."],
  },
  status: {
    type: String,
    required: [true, "Please provide a valid user status."],
    enum: {
      values: Object.values(userStatusEnum),
      message: "{VALUE} is not a valid user status.",
    },
  },
  role: {
    type: String,
    required: [true, "Please provide a valid role for the user."],
    enum: {
      values: Object.values(userRoleEnum),
      message: "{VALUE} is not a valid user status.",
    },
  },
});

module.exports = mongoose.model("user", user);
