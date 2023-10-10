const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const randomName = faker.person.fullName();
const randomEmail = faker.internet.email();
console.log(randomName, randomEmail);

const Job = require("./models/Job");
const Application = require("./models/Application");
const User = require("./models/User");
const Hr = require("./models/Hr");
const UserProfile = require("./models/UserProfile");

mongoose.connect("mongodb://localhost:27017/joblisting", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createRandomUser = () => {
  const password = "123"; // Set the desired password here
  const saltRounds = 10; // Number of salt rounds for bcrypt

  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  return new User({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: hashedPassword,
    registrationDate: faker.date.past(),
    lastLoginDate: faker.date.recent(),
  });
};

const createRandomHr = () => {
  const password = "123"; // Set the desired password here
  const saltRounds = 10; // Number of salt rounds for bcrypt

  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  return new Hr({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: hashedPassword,
    registrationDate: faker.date.past(),
    lastLoginDate: faker.date.recent(),
  });
};

const createRandomJob = (hrUser) => {
  return new Job({
    hrUser,
    title: faker.person.jobTitle(),
    company_name: faker.company.name(),
    description: faker.lorem.paragraph(),
    requirement: [faker.lorem.word(), faker.lorem.word()],
    benefit: [faker.lorem.word(), faker.lorem.word()],
    additional: faker.lorem.sentence(),
    location: faker.location.city(),
    salary: faker.finance.amount(),
    applicationDeadline: faker.date.future(),
    postedDate: faker.date.past(),
    jobType: faker.helpers.arrayElement([
      "CONTRACT",
      "FULL_TIME",
      "INTERNSHIP",
    ]),
  });
};

const createRandomApplication = (user, job) => {
  return new Application({
    user,
    job,
    applicationDate: faker.date.past(),
    status: faker.helpers.arrayElement(["Pending", "Accepted", "Rejected"]),
    coverLetter: faker.lorem.paragraph(),
    resume: faker.system.filePath(),
  });
};

const createRandomUserProfile = (user) => {
  return new UserProfile({
    user,
    name: faker.person.fullName(),
    contactNumber: faker.phone.number(),
    address: faker.location.streetAddress(),
    resume: faker.system.filePath(),
    bio: faker.lorem.sentence(),
    skills: [faker.lorem.word(), faker.lorem.word()],
    education: faker.lorem.sentence(),
    experience: faker.lorem.sentence(),
  });
};

const populateUsers = async () => {
  try {
    for (let i = 0; i < 500; i++) {
      const user = createRandomUser();
      await user.save();
    }
    console.log("Users populated successfully.");
  } catch (err) {
    console.error("Error populating users:", err);
  }
};

const populateHRs = async () => {
  try {
    for (let i = 0; i < 20; i++) {
      const hr = createRandomHr();
      await hr.save();
    }
    console.log("HRs populated successfully.");
  } catch (err) {
    console.error("Error populating HRs:", err);
  }
};

const populateJobs = async () => {
  try {
    const hrUsers = await Hr.find({});
    for (let i = 0; i < hrUsers.length; i++) {
      const hrUser = hrUsers[i];
      for (let j = 0; j < 50; j++) {
        const job = createRandomJob(hrUser._id);
        await job.save();
      }
    }
    console.log("Jobs populated successfully.");
  } catch (err) {
    console.error("Error populating jobs:", err);
  }
};

const populateApplications = async () => {
  try {
    const users = await User.find({});
    const jobs = await Job.find({});

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userJobsApplied = []; // Keep track of jobs the user has applied to

      while (userJobsApplied.length < 20) {
        // Continue until the user has applied to at least 20 jobs
        const randomJob = faker.helpers.arrayElement(jobs);

        // Check if the user has already applied to this job
        if (!userJobsApplied.includes(randomJob._id)) {
          const application = createRandomApplication(user._id, randomJob._id);
          await application.save();
          userJobsApplied.push(randomJob._id);
        }
      }
    }

    console.log("Applications populated successfully.");
  } catch (err) {
    console.error("Error populating applications:", err);
  }
};

const populateUserProfiles = async () => {
  try {
    const users = await User.find({});
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userProfile = createRandomUserProfile(user._id);
      await userProfile.save();
    }
    console.log("User profiles populated successfully.");
  } catch (err) {
    console.error("Error populating user profiles:", err);
  } finally {
    mongoose.connection.close(); // Close the database connection when done
  }
};

// Call the functions to populate data
(async () => {
  await populateUsers();
  await populateHRs();
  await populateJobs();
  await populateApplications();
  await populateUserProfiles();
})();
