const express = require("express");
const router = express.Router();

const {
  getVegetables,
  getVegetablesById,
  addVegetable,
  updateVegetable,
  deleteVegetables,
} = require("../controllers/vegetableController");

router.get("/vegetables", getVegetables);
router.get("/vegetables/:id", getVegetablesById);
router.post("/vegetables", addVegetable);
router.patch("/vegetables/:id", updateVegetable);
router.delete("/vegetables/:id", deleteVegetables);

module.exports = router;
