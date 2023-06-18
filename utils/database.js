const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DATABASE CONNECTED"))
    .catch((err) => console.log(err));
};

module.exports = connectDatabase;
