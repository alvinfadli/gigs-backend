const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  contactNumber: String,
  address: String,
  resume: String,
  bio: String,
  skills: [String],
  education: String,
  experience: String,
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
