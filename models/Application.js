const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  applicationDate: Date,
  status: String,
  coverLetter: String,
  resume: String,
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
