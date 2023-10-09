const jwt = require("jsonwebtoken");
const Hr = require("../models/Hr");
const bcrypt = require("bcrypt");
const { resJSON } = require("../responseHandler");

const jwtSecretKey = process.env.TOKEN_SECRET;

async function hrAuthenticate(req, res) {
  const { email, password } = req.body;

  try {
    const hr = await Hr.findOne({ email });

    if (!hr) {
      return resJSON(res, 401, null, "No user registered with this email");
    }

    const isPasswordValid = await bcrypt.compare(password, hr.password);

    if (!isPasswordValid) {
      return resJSON(res, 401, null, "Email and password are incorrect");
    }

    const accessToken = jwt.sign(
      {
        id: hr._id,
        name: hr.name,
        email: hr.email,
        userType: "hr",
      },
      jwtSecretKey,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      {
        id: hr._id,
        email: hr.email,
      },
      jwtSecretKey,
      { expiresIn: "7d" }
    );

    resJSON(res, 200, {
      accessToken,
      refreshToken,
      userType: "hr",
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
}

module.exports = {
  hrAuthenticate,
};
