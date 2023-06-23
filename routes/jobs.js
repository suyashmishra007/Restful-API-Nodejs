const express = require("express");
const jobsController = require("../controllers/jobsControllers");
const router = express.Router();
const {isAuthenticatedUser , authorizedRole } = require('../middlewares/auth');

router.get("/jobs", jobsController.getJobs);

router.get("/job/:_id/:slug", jobsController.getJob);

router.get("/stats/:topic", jobsController.jobStats);

router.get("/jobs/:zipcode/:distance", jobsController.getJobsInRadius);

router.post("/job/new", isAuthenticatedUser,authorizedRole('admin', 'employeer'), jobsController.newJob);

router.put("/job/:_id", isAuthenticatedUser, authorizedRole('admin', 'employeer'),jobsController.updateJob);

router.delete("/job/:_id", isAuthenticatedUser,authorizedRole('admin', 'employeer'),jobsController.deleteJob);

module.exports = router;
