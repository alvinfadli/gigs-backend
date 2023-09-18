require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/joblisting";

//Models
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");

//Routes
const register = require("./routes/register");

const app = express();

mongoose.connect(url, { useNewUrlParser: true });
const con = mongoose.connection;

con.on("open", () => {
  console.log("connected...");
});

// Middleware
app.use(express.json());

//Using Register Router
app.use("/api", register);

// const Application = require("./models/Application");
// const Job = require("./models/Job");
// const authRoutes = require("./routes/auth"); // Import authentication routes
// const { authenticate, jwtSecretKey } = require("./middlewares/authMiddleware"); // Import authentication controller
// const userProfileRoutes = require("./routes/userProfile");
// const jobRoutes = require("./routes/job");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");

// app.use(cors());

// // Connect to MongoDB
// mongoose
//   .connect(
//     "mongodb+srv://alvinfadli:alvinmongo123@projects.fx8surx.mongodb.net/joblistings",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error("Error connecting to MongoDB:", err);
//   });

// // Define your routes here

// // Authentication route
// app.use("/api/auth", authRoutes);

// // Use the registration route
// app.use("/api", registrationRoutes);

// app.use("/api", userProfileRoutes);

// app.use("/api", jobRoutes);

// // Protected route example (requires authentication)
// app.get("/api/protected", authenticate, (req, res) => {
//   // Access user data from req.user (includes userType)
//   res
//     .status(200)
//     .json({ message: "Protected route", userType: req.user.userType });
// });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});