const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//database
const connectMongoDB = require("./modules/database/mongoDB");
const chalk = require("chalk");
connectMongoDB();

//middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173", // อนุญาตเฉพาะ Frontend ที่กำหนด
    credentials: true, // อนุญาตส่ง Cookie ระหว่างโดเมน
  })
);
app.use(express.json());
app.use(cookieParser());

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.listen(5000, () => console.log("Server is Running on Port "+chalk.yellow("5000")));
