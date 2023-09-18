const jwt = require("jsonwebtoken");
const Hr = require("../models/Hr");
const bcrypt = require("bcrypt");

const jwtSecretKey = process.env.TOKEN_SECRET;

async function hrAuthenticate(req, res, next) {
  const { email, password } = req.body;

  try {
    const hr = await Hr.findOne({ email });

    if (!hr) {
      return res.status(401).json({
        error: {
          code: 401,
          message: "No user registered with this email",
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, hr.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 401,
          message: "Email and password are incorrect",
        },
      });
    }

    const accessToken = jwt.sign(
      {
        id: hr._id,
        email: hr.email,
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

    req.accessToken = accessToken;
    req.refreshToken = refreshToken;

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({
      error: {
        code: 500,
        message: "Internal Server Error",
      },
    });
  }
}

module.exports = {
  hrAuthenticate,
};
