const express = require("express");
const router = express.Router();

const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const {
  getAllOrder,
  getTopVegetablesByFarmer,
} = require("../controllers/orderController");

router.get("/orders", getAllOrder);
router.get("/top-vegetables/:farmerId", verifyToken, getTopVegetablesByFarmer);

module.exports = router;
