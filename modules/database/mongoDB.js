const mongoose = require("mongoose");
require("dotenv").config();
const chalk = require("chalk");
const { MONGODBDATABASEURI } = process.env;

const connectMongoDB = async () => {
  if (!MONGODBDATABASEURI) {
    console.error(chalk.red("MongoDB URI is not defined"));
    return;
  }

  try {
    // เชื่อมต่อ MongoDB
    await mongoose.connect(MONGODBDATABASEURI);
    console.log(chalk.blue("MongoDB Connected"));
  } catch (err) {
    console.error(chalk.red("Error connecting to MongoDB:"), err);
  }
};

module.exports = connectMongoDB;
