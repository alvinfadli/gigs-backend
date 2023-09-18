const express = require("express");
const router = express.Router();
const UserProfile = require("../models/UserProfile"); // Import the UserProfile model
const auth = require("../middlewares/authMiddleware"); // Import the authentication middleware

// Edit user profile route
router.put("/edit", auth.authenticate, async (req, res) => {
  const {
    name,
    contactNumber,
    address,
    resume,
    bio,
    skills,
    education,
    experience,
  } = req.body;
  const userId = req.user.id; // Get the logged-in user's ID from the authentication middleware
  console.log("test");

  try {
    // Find the user profile by the user's ID
    const userProfile = await UserProfile.findOne({ user: userId });

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Update the user profile fields
    userProfile.name = name || userProfile.name;
    userProfile.contactNumber = contactNumber || userProfile.contactNumber;
    userProfile.address = address || userProfile.address;
    userProfile.resume = resume || userProfile.resume;
    userProfile.bio = bio || userProfile.bio;
    userProfile.skills = skills || userProfile.skills;
    userProfile.education = education || userProfile.education;
    userProfile.experience = experience || userProfile.experience;

    // Save the updated user profile
    await userProfile.save();

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Edit user profile error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
