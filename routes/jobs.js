const express = require("express");
const jobsController = require("../controllers/jobsControllers");
const router = express.Router();

router.get("/jobs", jobsController.getJobs);

router.get("/job/:_id/:slug", jobsController.getJob);

router.get("/stats/:topic", jobsController.jobStats);

router.post("/job/new", jobsController.newJob);

router.get("/jobs/:zipcode/:distance", jobsController.getJobsInRadius);

router.put("/job/:_id", jobsController.updateJob);

router.delete("/job/:_id", jobsController.deleteJob);

module.exports = router;
