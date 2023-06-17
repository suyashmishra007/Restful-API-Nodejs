const mongoose = require("mongoose");

const connectDatabase = (DB_URI) => {
  mongoose
    .connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DATABASE CONNECTED"))
    .catch((err) => console.log(err));
};

module.exports = connectDatabase;
