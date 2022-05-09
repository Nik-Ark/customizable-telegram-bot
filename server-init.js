const express = require("express");
const connectDB = require("./config/connectDB");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(express.json());

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Express server is listening on port: ${PORT}`);
  });
});

module.exports = app;
