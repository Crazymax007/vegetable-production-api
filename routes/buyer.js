const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const { getBuyer, getBuyerById, addBuyer, updateBuyer, deleteBuyer } = require("../controllers/buyerController");

router.get("/admin/buyer", getBuyer);
router.get("/admin/buyer/:id", getBuyerById);
router.post("/admin/buyer", addBuyer);
router.put("/admin/buyer/:id", updateBuyer);
router.delete("/admin/buyer/:id", deleteBuyer);

module.exports = router;
