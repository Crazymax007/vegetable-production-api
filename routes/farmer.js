const express = require("express");
const router = express.Router();

const { addFarmer } = require("../controllers/farmerController");

router.post("/admin/farmer", addFarmer);

module.exports = router;