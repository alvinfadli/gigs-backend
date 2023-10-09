const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const auth = require("../../middlewares/authMiddleware");
const { resJSON } = require("../../responseHandler");

router.post(
  "/create-job",
  auth.authenticate,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("company_name").notEmpty().withMessage("Company name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("salary").notEmpty().withMessage("Salary is required"),
    body("applicationDeadline")
      .notEmpty()
      .withMessage("Application deadline is required")
      .isISO8601()
      .withMessage("Application deadline must be a valid date"),
    body("postedDate").notEmpty().withMessage("Posted date is required"),
    body("jobType")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["CONTRACT", "FULL_TIME", "INTERNSHIP"])
      .withMessage("Invalid status value"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return resJSON(res, 400, errors.array(), "Validation failed");
      }
      if (req.userType !== "hr") {
        return resJSON(res, 403, null, "Only HR users can create jobs");
      }

      const newJob = new Job(req.body);
      newJob.hrUser = req.user;

      await newJob.save();

      resJSON(res, 201, newJob, "Job created successfully");
    } catch (error) {
      console.error("Job creation error:", error);
      resJSON(res, 500, null, "Internal Server Error");
    }
  }
);

router.put(
  "/edit-job/:jobId",
  auth.authenticate,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("company_name").notEmpty().withMessage("Company name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("salary").notEmpty().withMessage("Salary is required"),
    body("applicationDeadline")
      .notEmpty()
      .withMessage("Application deadline is required")
      .isISO8601()
      .withMessage("Application deadline must be a valid date"),
    body("postedDate").notEmpty().withMessage("Posted date is required"),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["CONTRACT", "FULL_TIME", "INTERNSHIP"])
      .withMessage("Invalid status value"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return resJSON(res, 400, null, errors.array());
      }

      if (req.user.userType !== "hr") {
        return resJSON(res, 403, null, "Only HR users can edit jobs");
      }

      const jobId = req.params.jobId;

      const existingJob = await Job.findById(jobId);
      if (!existingJob) {
        return resJSON(res, 404, null, "Job not found");
      }

      existingJob.title = req.body.title;
      existingJob.company_name = req.body.company_name;
      existingJob.description = req.body.description;
      existingJob.location = req.body.location;
      existingJob.salary = req.body.salary;
      existingJob.applicationDeadline = req.body.applicationDeadline;
      existingJob.postedDate = req.body.postedDate;
      existingJob.status = req.body.status;

      await existingJob.save();

      resJSON(res, 200, existingJob, { message: "Job updated successfully" });
    } catch (error) {
      console.error("Job update error:", error);
      resJSON(res, 500, null, "Internal Server Error");
    }
  }
);

router.get("/jobs", auth.authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const skip = (page - 1) * perPage;

    const jobs = await Job.find().skip(skip).limit(perPage);

    resJSON(res, 200, jobs);
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
});

router.get("/jobs/:jobId", auth.authenticate, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);

    if (!job) {
      return resJSON(res, 404, null, "Job not found");
    }

    resJSON(res, 200, job);
  } catch (error) {
    console.error("Error retrieving job by ID:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
});

router.get("/jobs/apply/:jobId", auth.authenticate, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user;

    const existingApplication = await Application.findOne({
      user: userId,
      job: jobId,
    });

    if (existingApplication) {
      return resJSON(res, 400, {
        message: "You have already applied for this job.",
      });
    }

    const newApplication = new Application({
      user: userId,
      job: jobId,
      applicationDate: new Date(),
      status: "Pending",
    });

    await newApplication.save();

    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: newApplication._id },
    });

    resJSON(res, 200, { message: "Job application successful" });
  } catch (error) {
    console.error("Error applying for a job:", error);
    resJSON(res, 500, null, "Internal Server Error");
  }
});

module.exports = router;
