const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Your secret key for JWT (should match the one used in auth.js)
const jwtSecretKey = process.env.TOKEN_SECRET;

// Sample user data for authentication (replace with your database logic)
async function authenticate(req, res, next) {
  const { email, password } = req.body;

  try {
    // Find the user by email in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Create a JWT token with user data
    const accessToken = jwt.sign(
      {
        id: user._id, // Assuming you have an "_id" field in your User model
        email: user.email,
        userType: user.userType,
      },
      jwtSecretKey,
      { expiresIn: "1h" } // Token expiration time (adjust as needed)
    );

    const refreshToken = jwt.sign(
      {
        id: user._id, // Assuming you have an "_id" field in your User model
        email: user.email,
        userType: user.userType,
      },
      jwtSecretKey,
      { expiresIn: "7d" } // Token expiration time (adjust as needed)
    );

    // Store the token in the request for use in other routes
    req.accessToken = accessToken;
    req.refreshToken = refreshToken;
    req.userType = user.userType;
    next();
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  authenticate,
};
