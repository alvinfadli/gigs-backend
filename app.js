require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/joblisting";

//Models
const User = require("./models/User");
const Hr = require("./models/Hr");
const UserProfile = require("./models/UserProfile");

//Routes
const userRegisterRoute = require("./routes/user/register");
const userLoginRoute = require("./routes/user/login");

const hrRegisterRoute = require("./routes/hr/register");
const hrLoginRoute = require("./routes/hr/login");

//Middlewares
const { authenticate, jwtSecretKey } = require("./middlewares/authMiddleware");

const app = express();

mongoose.connect(url, { useNewUrlParser: true });
const con = mongoose.connection;

con.on("open", () => {
  console.log("connected...");
});

// Middleware
app.use(express.json());

//Using register route
app.use("/api", userRegisterRoute);
app.use("/api/hr", hrRegisterRoute);

//Using login route
app.use("/api/auth", userLoginRoute);
app.use("/api/hr/auth", hrLoginRoute);

// Protected route (requires authentication)
app.get("/api/protected", authenticate, (req, res) => {
  // Access user data from req.user (includes userType)
  res.status(200).json({ message: "Protected route" });
});

// const Application = require("./models/Application");
// const Job = require("./models/Job");
// Import authentication controller
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

// // Use the registration route
// app.use("/api", registrationRoutes);

// app.use("/api", userProfileRoutes);

// app.use("/api", jobRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
