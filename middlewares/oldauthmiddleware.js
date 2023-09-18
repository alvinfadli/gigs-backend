const jwt = require("jsonwebtoken");

// Your secret key for JWT (should match the one used for generating tokens)
const jwtSecretKey = process.env.TOKEN_SECRET;

// Middleware function to authenticate requests
function authenticate(req, res, next) {
  // Get the token from the request headers, query parameters, or cookies (customize as needed)
  // const accessToken = req.headers.authorization.split(" ")[1];

  // if (!accessToken) {
  //   return res.status(401).json({ message: "Authentication required" });
  // }

  // // Verify the token
  // jwt.verify(accessToken, jwtSecretKey, (err, decoded) => {
  //   if (err) {
  //     console.log(jwtSecretKey);
  //     console.log(accessToken);
  //     console.error("Error verifying token:", err);
  //     return res.status(401).json({ message: "Invalid token" });
  //   }

  //   // Store user information in the request for use in other routes
  //   req.user = decoded;
  //   next();
  // });
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if the header has the expected format "Bearer <token>"
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ message: "Invalid authorization header format" });
  }

  const accessToken = parts[1];

  // Verify the token
  jwt.verify(accessToken, jwtSecretKey, (err, decoded) => {
    if (err) {
      console.log(jwtSecretKey);
      console.log(accessToken);
      console.error("Error verifying token:", err);
      return res.status(401).json({ message: "Invalid token" });
    }

    // Store user information in the request for use in other routes
    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticate,
};
