const express = require("express");
const { authenticate } = require("../../middlewares/authMiddleware");
const { resJSON } = require("../../responseHandler");
const mongoose = require("mongoose");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
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

    return resJSON(res, 200, {
      activeJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
