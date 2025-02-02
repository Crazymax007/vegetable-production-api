const express = require("express");
const router = express.Router();

const { getAllOrder,getTopVegetablesByFarmer } = require("../controllers/orderController");

router.get("/orders", getAllOrder);
router.get("/top-vegetables/:farmerId", getTopVegetablesByFarmer);

module.exports = router;
