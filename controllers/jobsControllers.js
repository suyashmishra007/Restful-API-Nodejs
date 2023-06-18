const catchAsyncError = require("../middlewares/catchAsyncError");
const JobModel = require("../models/jobs");
const ErrorHandler = require("../utils/errorHandler");
const geocoder = require("../utils/geocoder");
const jobsController = {
  // Create a new Job => api/v1/job/new
  // TODO: add catchAsyncError to every function
  // TODO: add return next(new ErrorHandler('Job not found' , 404)); in required functions.
  newJob: catchAsyncError(async (req, res, next) => {
    const job = await JobModel.create(req.body);
    res.status(200).json({
      success: true,
      message: "Job Created",
      data: job,
    });
  }),

  // Get all Jobs => api/v1/jobs
  getJobs: async (req, res, next) => {
    const jobs = await JobModel.find();
    res.status(200).json({
      success: true,
      results: jobs.length,
      data: jobs,
    });
  },
  // Get single job by id and slug => api/v1/job/:_id/:slug
  getJob: async (req, res, next) => {
    const { _id, slug } = req.params;
    const job = await JobModel.findOne({
      _id,
      slug,
    });
    res.status(200).json({
      success: true,
      data: job,
    });
  },
  // Get all the jobs within distance of the zipcode => /api/v1/jobs/:zipcode/:distance
  getJobsInRadius: async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Getting latitude and longitude from geocoder with zipcode.
    const loc = await geocoder.geocode(zipcode);
    const latitude = loc[0].latitude;
    const longitude = loc[0].longitude;
    // 3963 is the redius of the earth in mile.
    const radius = distance / 3963;
    const jobs = await JobModel.find({
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
      },
    });

    res.status(200).json({
      success: true,
      results: jobs.length,
      data: jobs,
    });
  },

  // Update the job => api/v1/job/:_id
  updateJob: async (req, res,next) => {
    // const updateJob = await JobModel.findOneAndUpdate()
    const { _id } = req.params;
    const job = await JobModel.findOne({_id});
    if(!job){
      return next(new ErrorHandler('Job not found' , 404));
    }
    const updateJob = await JobModel.findByIdAndUpdate(
      {
        _id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updateJob,
    });
  },

  // delete a job by id => api/v1/job/:_id
  deleteJob: async (req, res) => {
    const { _id } = req.params;
    const jobDeleted = await JobModel.findByIdAndDelete({ _id });
    res.status(200).json({
      success: true,
      data: jobDeleted,
    });
  },

  // Get stats about the topic(job) => api/v1/stats/:topic
  jobStats: async (req, res) => {
    const { topic } = req.params;

    const stats = await JobModel.aggregate([
      {
        $match: { $text: { $search: "\"" + topic + "\"" } }
      },
      {
        $group: {
          _id: { $toUpper: '$experience' },
          totalJobs: { $sum: 1 },
          avgPosition: { $avg: '$positions' },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
};

module.exports = jobsController;
