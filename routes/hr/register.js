const express = require("express");
const router = express.Router();
const Hr = require("../../models/Hr");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { username, email, password, re_password } = req.body;

  try {
    const existingUser = await Hr.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 400,
          message: "Username or email already exists",
        },
      });
    }

    if (password !== re_password) {
      return res.status(400).json({
        error: {
          code: 400,
          message: "Passwords do not match",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Hr({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      data: {
        message: "Hr Account registered successfully",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: {
        code: 500,
        message: "Internal Server Error",
      },
    });
  }
});

module.exports = router;
