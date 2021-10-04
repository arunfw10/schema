const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
const connect = () => {
  return mongoose.connect("mongodb://127.0.0.1:27017/jobs");
};

//company schema --------------------------
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  openJobs: [
    { type: mongoose.Schema.Types.ObjectId, ref: "jobs", required: false },
  ],
});

const Company = mongoose.model("company", companySchema);

app.post("/company", async (req, res) => {
  const item = await Company.create(req.body);
  return res.status(201).send({ item });
});
app.get("/company", async (req, res) => {
  const item = await Company.find().populate("openJobs").lean().exec();
  return res.status(200).send({ item });
});

//jobs schema --------------------------
const jobsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
    required: false,
  },
  salary: { type: Number, required: true },
  city: { type: String, required: true },
  skill: [{ type: String, required: true }],
  wfh: { type: Boolean, required: true },
  noticePeriod: { type: Number, required: true },
  rating: { type: Number, required: true },
});

const Jobs = mongoose.model("jobs", jobsSchema);

app.post("/jobs", async (req, res) => {
  const item = await Jobs.create(req.body);

  await Company.update(
    { _id: req.body.company },
    { $addToSet: { openJobs: item.id } }
  );

  return res.status(201).send({ item });
});
app.get("/jobs", async (req, res) => {
  const item = await Jobs.find().lean().exec();

  return res.status(200).send({ item });
});

//jobs in a city with skill-------------------
app.get("/jobsInCity/:city/:skill", async (req, res) => {
  console.log(req.params);
  var jobs = [];
  await (
    await Jobs.find()
  ).forEach((el) => {
    if (el.city == req.params.city && el.skill.includes(req.params.skill)) {
      jobs.push(el);
    }
  });

  return res.status(200).send({ jobs });
});

//jobs that are work from home-------------------
app.get("/wfhJobs", async (req, res) => {
  console.log("here");
  var jobs = [];
  await (
    await Jobs.find()
  ).forEach((el) => {
    console.log(el.wfh);
    if (el.wfh == true) {
      jobs.push(el);
    }
  });

  return res.status(200).send({ jobs });
});
//find all the jobs that will accept a notice period of 2 months.

//NOtice period n months-------------------
app.get("/noticePeriod/:n", async (req, res) => {
  console.log(req.params);
  var jobs = [];
  await (
    await Jobs.find()
  ).forEach((el) => {
    if (el.noticePeriod == req.params.n) {
      jobs.push(el);
    }
  });

  return res.status(200).send({ jobs });
});

// find all jobs by sorting the jobs as per their rating.

//Sorting jobs according to rating-------------------
app.get("/jobs/sort/rating", async (req, res) => {
  // console.log(req.params.n);
  var jobs = await Jobs.find();

  jobs.sort(function (a, b) {
    return b.rating - a.rating;
  });
  console.log(jobs);
  return res.status(200).send({ jobs });
});

//api to get details of the company.

app.get("/company/:company", async (req, res) => {
  const item = await Company.findOne({ name: req.params.company })
    .populate("openJobs")
    .lean()
    .exec();
  return res.status(200).send({ item });
});

//find the company that has the most open jobs.

app.get("/companyWithMostJobs", async (req, res) => {
  //var jobs = [];
  var max = -Infinity;
  var most;
  await (
    await Company.find()
  ).forEach((el) => {
    if (el.openJobs.length > max) {
      max = el;
    }
  });

  return res.status(200).send({ max });
});

app.listen(2345, async function () {
  await connect();
  console.log("listening on port 2345");
});
