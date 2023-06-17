const express = require("express");
const connectDatabase = require("./utils/database");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Connecting to database
connectDatabase(process.env.DB_URI);

// Setup bodyparser
app.use(express.json());

// Importing all routes
const jobs = require("./routes/jobs");
app.use("/api/v1", jobs);

app.listen(PORT, () => {
  console.log(`server starting on port ${PORT} in ${process.env.NODE_ENV}`);
});
