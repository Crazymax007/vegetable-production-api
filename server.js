require('dotenv').config();

const express = require("express");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const chalk = require("chalk");

const app = express();
const connectMongoDB = require("./modules/database/mongoDB");
connectMongoDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5175",
    "https://front-end-project-r4t3.onrender.com"
  ],
  credentials: true, 
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use("/", require("./routes/index"));
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.listen(process.env.PORT, () =>
  console.log("Server is Running on Port " + chalk.yellow(process.env.PORT))
);
