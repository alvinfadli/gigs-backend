const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  hrUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hr",
  },
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  ],
  title: String,
  company_name: String,
  description: String,
  requirement: [String],
  benefit: [String],
  additional: String,
  location: String,
  salary: String,
  applicationDeadline: Date,
  postedDate: Date,
  jobType: {
    type: String,
    enum: ["CONTRACT", "FULL_TIME", "INTERNSHIP"],
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
