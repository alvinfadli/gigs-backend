const express = require("express");
const { authenticate } = require("../../middlewares/authMiddleware");
const { resJSON } = require("../../responseHandler");
const mongoose = require("mongoose");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const UserProfile = require("../../models/UserProfile");
const router = express.Router();

// Authentication route
router.get("/alljobs", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);
    console.log(hrUserId);

    const result = await Job.aggregate([
      {
        $match: { hrUser: hrUserId },
      },
      {
        $group: {
          _id: "$hrUser",
          totalJobs: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      // No jobs found for the HR user
      return resJSON(res, 200, { totalJobs: 0 });
    }

    // Extract the total job count from the result
    const totalJobs = result[0].totalJobs;

    // Respond with the total job count
    resJSON(res, 200, { totalJobs });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/activejobs/total", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);

    // Fetch active jobs based on the application deadline
    const currentDate = new Date();
    const totalActiveJobs = await Job.countDocuments({
      hrUser: hrUserId,
      applicationDeadline: { $gte: currentDate }, // Filter jobs with a deadline greater than or equal to the current date
    });
    return resJSON(res, 200, {
      totalActiveJobs,
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/totalapplications", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);

    // Fetch the total number of applications for HR's jobs
    const totalApplications = await Application.countDocuments({
      job: { $in: await Job.find({ hrUser: hrUserId }).distinct("_id") },
    });

    return resJSON(res, 200, {
      totalApplications,
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/totalapplications/pending", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);

    const totalPendingApplications = await Application.countDocuments({
      job: { $in: await Job.find({ hrUser: hrUserId }).distinct("_id") },
      status: "Pending",
    });

    return resJSON(res, 200, {
      totalPendingApplications,
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/activejobs", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);
    const { jobType } = req.query; // Get the jobType parameter from the query string

    // Define a filter object based on the jobType parameter
    const filter = {
      hrUser: hrUserId,
      applicationDeadline: { $gte: new Date() }, // Filter jobs with a deadline greater than or equal to the current date
    };

    // If jobType is provided in the query, add it to the filter
    if (jobType) {
      filter.jobType = jobType.toUpperCase(); // Assuming jobType values are stored in uppercase
    }

    // Fetch active jobs based on the filter
    const activeJobs = await Job.find(filter);

    // Create an array to store the modified job objects with the total number of applications
    const jobsWithTotalApplications = [];

    // Iterate through the activeJobs and calculate the total number of applications for each job
    for (const job of activeJobs) {
      const totalApplications = await Application.countDocuments({
        job: job._id,
        status: "Pending",
      });
      const jobWithTotalApplications = {
        ...job.toObject(), // Convert the Mongoose document to a plain object
        totalApplications,
      };
      jobsWithTotalApplications.push(jobWithTotalApplications);
    }

    return resJSON(res, 200, {
      activeJobs: jobsWithTotalApplications, // Return the modified job objects with total applications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/activejobs/user-applied", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);
    const { id } = req.query;

    const filter = {
      hrUser: hrUserId,
    };

    if (id) {
      filter._id = id;
    }

    const jobDetails = await Job.find(filter)
      .populate({
        path: "applications",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .exec();

    const usersApplied = [];

    for (const job of jobDetails) {
      for (const application of job.applications) {
        const user = application.user;

        // Fetch user profile information from UserProfile model
        const userProfile = await UserProfile.findOne({ user: user._id });

        // Check if the application status is "Pending"
        if (application.status === "Pending") {
          usersApplied.push({
            _id: user._id,
            name: user.name,
            email: user.email,
            contactNumber: userProfile ? userProfile.contactNumber : null,
            application_id: application._id,
            application_status: application.status,
            address: userProfile ? userProfile.address : null,
          });
        }
      }
    }

    return resJSON(res, 200, {
      usersApplied,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/applications/:id/reject", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );

    if (!application) {
      return res.status(404).send("Application not found");
    }

    res.send(application);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/applications/:id/accept", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Accepted" },
      { new: true }
    );

    if (!application) {
      return res.status(404).send("Application not found");
    }

    res.send(application);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/applications", authenticate, async (req, res) => {
  try {
    const jobId = req.query.jobId; // Get the job ID from the query parameter

    if (!jobId) {
      return res
        .status(400)
        .json({ error: "Job ID is required as a query parameter." });
    }

    // Fetch applications for the specified job ID with status "Pending" along with user details
    const applications = await Application.find({
      job: jobId,
      status: "Pending",
    }).populate("user", "name email"); // Populate the user field with name and email

    return res.json({
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
