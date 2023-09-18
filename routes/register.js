const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { username, name, email, password, re_password } = req.body;

  try {
    // Check if the username and email are unique
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Ensure the password and re_password match
    if (password !== re_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Create a new user with the hashed password
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

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
