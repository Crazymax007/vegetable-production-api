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
  deleteOrderDetail,
  getDashboardOrder,
  getTopVegetables
} = require("../controllers/orderController");

router.get("/orders", getAllOrder);
router.get("/ordersBoard", getDashboardOrder);
router.get("/orders/:orderId", getOrderById);
router.post("/orders", createOrder);
router.delete("/orders/:orderId", deleteOrder);
router.delete("/orders/:orderId/details/:detailId", deleteOrderDetail);
router.put("/orders/:orderId", updateOrder);
router.get("/top-vegetables/:farmerId", verifyToken, getTopVegetablesByFarmer);
router.get("/top-vegetables/", verifyToken, getTopVegetables);

module.exports = router;
