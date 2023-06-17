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
    required: true,
    trim: true,
    maxLength: 100,
  },
  slug: String,
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  email: {
    type: String,
    // validate: validator.isEmail,
  },
  address: {
    type: String,
    required: true,
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
    required: true,
  },
  industry: {
    type: [String],
    required: true,
    enum: {
      values: industryValues,
    },
  },
  jobType: {
    type: String,
    required: true,
    enum: {
      values: JobTypesValues,
    },
  },
  minEducation: {
    type: String,
    required: true,
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
    required: true,
    enum: {
      values: experienceValues,
    },
  },
  salary: {
    type: Number,
    required: true,
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
