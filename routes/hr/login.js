const express = require("express");
const { hrAuthenticate } = require("../../controllers/hrController"); // Adjust the path as needed

const router = express.Router();

// Authentication route
router.post("/login", hrAuthenticate, (req, res) => {
  // Send the JWT token and user type in the response
  res.status(200).json({
    accessToken: req.accessToken,
    refreshToken: req.refreshToken,
    userType: req.userType,
  });
});

module.exports = router;
