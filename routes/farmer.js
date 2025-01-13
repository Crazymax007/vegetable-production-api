const express = require("express");
const router = express.Router();

const {
  addFarmer,
  getFarmer,
  getFarmerById,
  updateFarmerById,
  deleteFarmerById,
} = require("../controllers/farmerController");

router.post("/admin/farmer", addFarmer);
router.get("/admin/farmer", getFarmer);
router.get("/admin/farmer/:id", getFarmerById);
router.put("/admin/farmer/:id", updateFarmerById);
router.delete("/admin/farmer/:id", deleteFarmerById);

module.exports = router;
