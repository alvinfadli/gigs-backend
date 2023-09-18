// jobRoutes.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); // Import express-validator
const Job = require("../models/Job"); // Import the Job model
const auth = require("../middlewares/authMiddleware"); // Import the authentication middleware

// Create a new job with input validation
router.post(
  "/create-job",
  auth.authenticate,
  [
    // Validate input fields
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
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if the authenticated user is an HR user
      if (req.user.userType !== "HR") {
        return res
          .status(403)
          .json({ message: "Only HR users can create jobs" });
      }

      // Create a new job using the request body
      const newJob = new Job(req.body);
      newJob.hrUser = req.user.id; // Set the HR user ID

      // Save the job to the database
      await newJob.save();

      res
        .status(201)
        .json({ message: "Job created successfully", job: newJob });
    } catch (error) {
      console.error("Job creation error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.put(
  "/edit-job/:jobId",
  auth.authenticate,
  [
    // Validate input fields
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
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if the authenticated user is an HR user
      if (req.user.userType !== "HR") {
        return res.status(403).json({ message: "Only HR users can edit jobs" });
      }

      const jobId = req.params.jobId;

      // Find the job by ID and check if it exists
      const existingJob = await Job.findById(jobId);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Update the job fields with the request body
      existingJob.title = req.body.title;
      existingJob.company_name = req.body.company_name;
      existingJob.description = req.body.description;
      existingJob.location = req.body.location;
      existingJob.salary = req.body.salary;
      existingJob.applicationDeadline = req.body.applicationDeadline;
      existingJob.postedDate = req.body.postedDate;
      existingJob.status = req.body.status;

      // Save the updated job to the database
      await existingJob.save();

      res
        .status(200)
        .json({ message: "Job updated successfully", job: existingJob });
    } catch (error) {
      console.error("Job update error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/jobs", auth.authenticate, async (req, res) => {
  try {
    // Retrieve all jobs from the database
    const jobs = await Job.find();

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/jobs/:jobId", auth.authenticate, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Find the job by ID in the database
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Return the job details
    res.status(200).json(job);
  } catch (error) {
    console.error("Error retrieving job by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
