const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  hrUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  company_name: String,
  description: String,
  location: String,
  salary: String,
  applicationDeadline: Date,
  postedDate: Date,
  status: {
    type: String,
    enum: ["CONTRACT", "FULL_TIME", "INTERNSHIP"],
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
