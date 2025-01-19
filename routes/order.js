const express = require("express");
const router = express.Router();

const { getAllOrder, getOrderById } = require("../controllers/orderController");

router.get("/orders", getAllOrder);
router.get("/orders/:id", getOrderById);

module.exports = router;
