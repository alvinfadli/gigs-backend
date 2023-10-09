const express = require("express");
const { authenticate } = require("../../middlewares/authMiddleware");
const { resJSON } = require("../../responseHandler");
const mongoose = require("mongoose");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const router = express.Router();

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

    // No jobs found for the HR user
    if (result.length === 0) {
      return resJSON(res, 200, { totalJobs: 0 });
    }

    const totalJobs = result[0].totalJobs;

    resJSON(res, 200, { totalJobs });
  } catch (error) {
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
      applicationDeadline: { $gte: currentDate },
    });
    return resJSON(res, 200, {
      totalActiveJobs,
    });
  } catch (error) {
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/activejobs", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);
    const { jobType } = req.query;

    // Define a filter object based on the jobType parameter
    const filter = {
      hrUser: hrUserId,
      applicationDeadline: { $gte: new Date() },
    };

    if (jobType) {
      filter.jobType = jobType.toUpperCase();
    }

    const activeJobs = await Job.find(filter);

    return resJSON(res, 200, {
      activeJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/activejobs/details", authenticate, async (req, res) => {
  try {
    const hrUserId = new mongoose.Types.ObjectId(req.user);
    const { id } = req.query;

    // Define a filter object based on the id parameter
    const filter = {
      hrUser: hrUserId,
    };

    if (id) {
      filter._id = id;
    }

    console.log(filter);
    // Query the Job model and populate the user information from the Application model
    const jobDetails = await Job.find(filter)
      .populate({
        path: "applications",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .exec();

    return resJSON(res, 200, {
      jobDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
