const express = require("express");
const router = express.Router();

const { getAllOrder } = require("../controllers/orderController");

router.get("/orders", getAllOrder);

module.exports = router;
