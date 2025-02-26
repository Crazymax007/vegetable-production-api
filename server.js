require('dotenv').config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

//database
const connectMongoDB = require("./modules/database/mongoDB");
const chalk = require("chalk");
connectMongoDB();

//middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// โหลด route ทั้งหมดจากโฟลเดอร์ routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.listen(5000, () =>
  console.log("Server is Running on Port " + chalk.yellow("5000"))
);
