const mongoose = require("mongoose");

const hrSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  registrationDate: Date,
  lastLoginDate: Date,
});

const Hr = mongoose.model("Hr", hrSchema);

module.exports = Hr;
