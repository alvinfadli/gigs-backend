const jwt = require("jsonwebtoken");
const { resJSON } = require("../responseHandler");
const jwtSecretKey = process.env.TOKEN_SECRET;

// Middleware function to authenticate requests
function authenticate(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return resJSON(res, 401, null, "Authentication required");
  }

  // Check if the header has the expected format "Bearer <token>"
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return resJSON(res, 401, null, "Invalid authorization header format");
  }

  const accessToken = parts[1];
  // const accessToken = authorizationHeader;
  // Verify the token
  jwt.verify(accessToken, jwtSecretKey, (err, decoded) => {
    if (err) {
      return resJSON(res, 401, null, "Invalid token");
    }

    // Store user information in the request for use in other routes
    req.user = decoded.id;
    req.userName = decoded.name;
    req.userType = decoded.userType;
    next();
  });
}
module.exports = {
  authenticate,
};
