const express = require("express");
const router = express.Router();

const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const {
  getAllOrder,
  getTopVegetablesByFarmer,
  createOrder,
  deleteOrder,
  updateOrder,
  getOrderById,
} = require("../controllers/orderController");

router.get("/orders", getAllOrder);
router.get("/orders/:orderId", getOrderById);
router.post("/orders", createOrder);
router.delete("/orders/:orderId", deleteOrder);
router.put("/orders/:orderId", updateOrder);
router.get("/top-vegetables/:farmerId", verifyToken, getTopVegetablesByFarmer);

module.exports = router;
