const express = require("express");
const router = express.Router();
const Hr = require("../../models/Hr");
const bcrypt = require("bcrypt");
const { resJSON } = require("../../responseHandler");

router.post("/register", async (req, res) => {
  if (req.method !== "POST") {
    return resJSON(res, 405, null, "Method Not Allowed");
  }

  const { name, email, password, re_password } = req.body;

  try {
    const existingUser = await Hr.findOne({ email });

    if (existingUser) {
      return resJSON(res, 400, null, "email already exists");
    }

    if (password !== re_password) {
      return resJSON(res, 400, null, "Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Hr({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    resJSON(res, 201, { message: "Hr Account registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
});

module.exports = router;
