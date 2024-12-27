const mongoose = require("mongoose");
const { MONGODBDATABASEURI } = process.env;

const connectMongoDB = async () => {
  await mongoose
    .connect(
      MONGODBDATABASEURI,
      { dbName: "Project" },
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
      console.log(chalk.green("MongoDB Connected"));
    })
    .catch((err) => console.error(err));
};

module.exports = connectMongoDB;
