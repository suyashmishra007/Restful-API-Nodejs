const JobModel = require('../models/jobs');
const geoCoder = require('../utils/geocoder');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFilters = require('../utils/apiFilters');
const path = require('path');
const fs = require('fs');

// Get all JobModels  =>  /api/v1/JobModels
const jobsController = {

   getJobs: catchAsyncError(async (req, res, next) => {
        const apiFilters = new APIFilters(JobModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination();
        
        const JobModels = await apiFilters.query;
        
        res.status(200).json({
        success: true,
        results: JobModels.length,
        data: JobModels
    });
}),

// Create a new JobModel   =>  /api/v1/JobModel/new
newJob : catchAsyncError(async (req, res, next) => {
    
    // Adding user to body
    req.body.user = req.user.id;
    
    const JobModel = await JobModel.create(req.body);
    
    res.status(200).json({
        success: true,
        message: 'JobModel Created.',
        data: JobModel
    });
}),

// Get a single JobModel with id and slug   =>  /api/v1/JobModel/:id/:slug
getJob : catchAsyncError(async (req, res, next) => {

    const JobModel = await JobModel.find({ $and: [{ _id: req.params.id }, { slug: req.params.slug }] }).populate({
        path: 'user',
        select: 'name'
    });
    
    if (!JobModel || JobModel.length === 0) {
        return next(new ErrorHandler('JobModel not found', 404));
    }
    
    res.status(200).json({
        success: true,
        data: JobModel
    });
}),

// Update a JobModel  =>  /api/v1/JobModel/:id
updateJob : catchAsyncError(async (req, res, next) => {
    let JobModel = await JobModel.findById(req.params.id);
    
    if (!JobModel) {
        return next(new ErrorHandler('JobModel not found', 404));
    }

    // Check if the user is owner
    if (JobModel.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler(`User(${req.user.id}) is not allowed to update this JobModel.`))
    }
    
    JobModel = await JobModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    
    res.status(200).json({
        success: true,
        message: 'JobModel is updated.',
        data: JobModel
    });
}),

// Delete a JobModel   =>  /api/v1/JobModel/:id
    deleteJobModel : catchAsyncError(async (req, res, next) => {
    let JobModel = await JobModel.findById(req.params.id).select('+applicantsApplied');
    
    if (!JobModel) {
        return next(new ErrorHandler('JobModel not found', 404));
    }
    
    // Check if the user is owner
    if (JobModel.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler(`User(${req.user.id}) is not allowed to delete this JobModel.`))
    }
    
    // Deleting files associated with JobModel
    
    for (let i = 0; i < JobModel.applicantsApplied.length; i++) {
        let filepath = `${__dirname}/public/uploads/${JobModel.applicantsApplied[i].resume}`.replace('\\controllers', '');
        
        fs.unlink(filepath, err => {
            if (err) return console.log(err);
        });
    }
     
    JobModel = await JobModel.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
        success: true,
        message: 'JobModel is deleted.'
    })
    
}),

// Search JobModels with radius  =>  /api/v1/JobModels/:zipcode/:distance
getJobsInRadius : catchAsyncError(async (req, res, next) => {
    const { zipcode, distance } = req.params;
    
    // Getting latitude & longitude from geocoder with zipcode
    const loc = await geoCoder.geocode(zipcode);
    const latitude = loc[0].latitude;
    const longitude = loc[0].longitude;
    
    const radius = distance / 3963;
    
    const JobModels = await JobModel.find({
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
    });
    
    res.status(200).json({
        success: true,
        results: JobModels.length,
        data: JobModels
    });
    
}),

// Get stats about a topic(JobModel)  =>  /api/v1/stats/:topic
jobStats : catchAsyncError(async (req, res, next) => {
    const stats = await JobModel.aggregate([
        {
            $match: { $text: { $search: "\"" + req.params.topic + "\"" } }
        },
        {
            $group: {
                _id: { $toUpper: '$experience' },
                totalJobModels: { $sum: 1 },
                avgPosition: { $avg: '$positions' },
                avgSalary: { $avg: '$salary' },
                minSalary: { $min: '$salary' },
                maxSalary: { $max: '$salary' }
            }
        }
    ]);
    
    if (stats.length === 0) {
        return next(new ErrorHandler(`No stats found for - ${req.params.topic}`, 200));
    }
    
    res.status(200).json({
        success: true,
        data: stats
    });
}),

// Apply to JobModel using Resume  =>  /api/v1/JobModel/:id/apply
applyJob : catchAsyncError(async (req, res, next) => {
    let JobModel = await JobModel.findById(req.params.id).select('+applicantsApplied');
    
    if (!JobModel) {
        return next(new ErrorHandler('JobModel not found.', 404));
    }
    
    // Check that if JobModel last date has been passed or not
    if (JobModel.lastDate < new Date(Date.now())) {
        return next(new ErrorHandler('You can not apply to this JobModel. Date is over.', 400));
    }
    
    // Check if user has applied before
    for (let i = 0; i < JobModel.applicantsApplied.length; i++) {
        if (JobModel.applicantsApplied[i].id === req.user.id) {
            return next(new ErrorHandler('You have already applied for this JobModel.', 400))
        }
    }
    
    // Check the files
    if (!req.files) {
        return next(new ErrorHandler('Please upload file.', 400));
    }
    
    const file = req.files.file;

    // Check file type
    const supportedFiles = /.docx|.pdf/;
    if (!supportedFiles.test(path.extname(file.name))) {
        return next(new ErrorHandler('Please upload document file.', 400))
    }
    
    // Check doucument size
    if (file.size > process.env.MAX_FILE_SIZE) {
        return next(new ErrorHandler('Please upload file less than 2MB.', 400));
    }

    // Renaming resume
    file.name = `${req.user.name.replace(' ', '_')}_${JobModel._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorHandler('Resume upload failed.', 500));
        }
        
        await JobModel.findByIdAndUpdate(req.params.id, {
            $push: {
                applicantsApplied: {
                    id: req.user.id,
                    resume: file.name
                }
            }
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });
        
        res.status(200).json({
            success: true,
            message: 'Applied to JobModel successfully.',
            data: file.name
        })
        
    });
})
}

module.exports = jobsController