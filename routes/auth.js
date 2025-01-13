const express = require("express");
const router = express.Router();
require("dotenv").config();

const { login} = require("../controllers/authController");

router.post("/auth/login", login);

module.exports = router;
