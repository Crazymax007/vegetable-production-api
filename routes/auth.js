const express = require("express");
const router = express.Router();
require("dotenv").config();

const { login, addUser, addFarmer } = require("../controllers/auth");

router.post("/admin/farmer", addFarmer);
router.post("/admin/user", addUser);
router.post("/auth/login", login);

module.exports = router;
