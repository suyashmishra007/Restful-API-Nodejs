const express = require("express");
const jobsController = require("../controllers/jobsController");
const router = express.Router();
const {isAuthenticatedUser , authorizedRole } = require('../middlewares/auth');

router.get("/jobs", jobsController.getJobs);

// TODO: Testing of the routes left
router.get("/job/:_id/:slug", jobsController.getJob);

router.get("/stats/:topic", jobsController.jobStats);

router.get("/jobs/:zipcode/:distance", jobsController.getJobsInRadius);

router.post("/job/new", isAuthenticatedUser,authorizedRole('admin', 'employeer'), jobsController.newJob);

router.put("/job/:_id", isAuthenticatedUser, authorizedRole('admin', 'employeer'),jobsController.updateJob);

router.delete("/job/:_id", isAuthenticatedUser,authorizedRole('admin', 'employeer'),jobsController.deleteJobModel);

router.put("/job/:id/apply", isAuthenticatedUser,authorizedRole('user'),jobsController.applyJob);

module.exports = router;
