const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

//database
const connectMongoDB = require("./modules/database/mongoDB");
connectMongoDB();

//middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.listen(5000, () => console.log("Server is Running 5000"));
