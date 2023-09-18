const express = require("express");
const { authenticate } = require("../../controllers/userController");
const { resJSON } = require("../../responseHandler");

const router = express.Router();

// Authentication route
router.post("/login", authenticate, (req, res) => {
  resJSON(res, 200, {
    accessToken: req.accessToken,
    refreshToken: req.refreshToken,
  });
});

module.exports = router;
