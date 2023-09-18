const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const UserProfile = require("../../models/UserProfile");
const { resJSON } = require("../../responseHandler");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  if (req.method !== "POST") {
    return resJSON(res, 405, null, "Method Not Allowed");
  }

  const { username, name, email, password, re_password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return resJSON(res, 400, null, "Username or email already exists");
    }

    if (password !== re_password) {
      return resJSON(res, 400, null, "Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userProfile = new UserProfile({
      user: newUser._id,
      name,
      contactNumber: "",
      address: "",
      resume: "",
      bio: "",
      skills: [],
      education: "",
      experience: "",
    });

    await userProfile.save();

    resJSON(res, 201, { message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
});
module.exports = router;
