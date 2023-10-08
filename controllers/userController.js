const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { resJSON } = require("../responseHandler");

const jwtSecretKey = process.env.TOKEN_SECRET;

async function authenticate(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return resJSON(res, 401, null, "No user registered with this email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return resJSON(res, 401, null, "Email and password are incorrect");
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userType: "user",
      },
      jwtSecretKey,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: "user",
      },
      jwtSecretKey,
      { expiresIn: "7d" }
    );

    resJSON(res, 200, {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
}

module.exports = {
  authenticate,
};
