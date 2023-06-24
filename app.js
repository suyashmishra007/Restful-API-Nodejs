const express = require("express");
const connectDatabase = require("./utils/database");
const cookieParser = require('cookie-parser');
const app = express();
const errorMiddleware = require('./middlewares/error');
const ErrorHandler = require("./utils/errorHandler");
const fileUpload = require('express-fileupload');
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// handling uncaught exception
process.on("uncaughtException",err =>{
  console.log(`Error : ${err.message}`);
  console.log(`Shutting down the server due to uncaughtException`)
  process.exit(1);
})

// Connecting to database
connectDatabase();

// Setup bodyparser
app.use(express.json());

// Set cookie parser
app.use(cookieParser());

// enable the express-fileupload 
app.use(
  fileUpload()
);

// Importing all routes
const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const user = require("./routes/user");
app.use("/api/v1", jobs);
app.use("/api/v1", auth);
app.use("/api/v1", user);


// Handle unhandled routes
app.all("*",(req,res,next)=>{
  next(new ErrorHandler(`${req.originalUrl} route not found`,404));
})

// Middleware to handle error
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`server starting on port ${PORT} in ${process.env.NODE_ENV}`);
});

// Handling Unhandled promise rejection
process.on('unhandledRejection',err=>{
  console.log(`Error : ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`)
  server.close(() => process.exit(1));
})
