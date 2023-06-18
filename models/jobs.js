const mongoose = require("mongoose");
const validator = require("validator");
const { Schema } = mongoose;
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");
const experienceValues = [
  "No Experience",
  "1-2 Years",
  "2-5 Years",
  "5+ Years",
];
const industryValues = [
  "Business",
  "Information Technology",
  "Banking",
  "Education/Training",
  "Telecommunication",
  "Others",
];
const JobTypesValues = ["Permanent", "Part-time", "Internship"];
const minEducationValues = ["Bachelors", "Masters", "Doctorate"];

const jobSchema = new Schema({
  title: {
    type: String,
    required : [true, 'Please enter Job title.'],
    trim : true,
    maxlength : [100, 'Job title can not exceed 100 characters.']
  },
  slug: String,
  description: {
    type : String,
    required : [true, 'Please enter Job description.'],
    maxlength : [1000, 'Job description can not exceed 1000 characters.']
  },
  email: {
    type: String,
    validate : [validator.isEmail, 'Please add a valid email address.']
},
  address: {
    type: String,
    required : [true, 'Please add an address.']
  },
  // * LOCATION
  location: {
    type: { type: String, enums: ["Point"] },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  company: {
    type: String,
    required : [true, 'Please add Company name.']
  },
  industry: {
    type: [String],
    required : [true , 'Please enter industry for this job.'],
    enum: {
      values: industryValues,
    },
  },
  jobType: {
    type: String,
    required : [true, 'Please enter job type.'],
    enum: {
      values: JobTypesValues,
    },
  },
  minEducation: {
    type: String,
    required : [true, 'Please enter minimum education for this job.'],
    enum: {
      values: minEducationValues,
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required : [true, 'Please enter experience required for this job.'],
    enum: {
      values: experienceValues,
      message : 'Please select correct options for Experience.'
    },
  },
  salary: {
    type: Number,
    required : [true, 'Please enter expected salary for this job.'],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7),
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
});

// Creating job-slug before saving
jobSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Setting up Location
jobSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
  next();
});

// TODO: add user and location , validation
const JobModel = mongoose.model("Job", jobSchema);
module.exports = JobModel;
