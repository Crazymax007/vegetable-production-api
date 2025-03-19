const express = require("express");
const router = express.Router();

const {
  getVegetables,
  getVegetablesById,
  addVegetable,
  updateVegetable,
  deleteVegetables,
} = require("../controllers/vegetableController");

const upload = require("../middleware/upload");

router.get("/vegetables", getVegetables);
router.get("/vegetables/:id", getVegetablesById);
router.post("/vegetables", upload.single("image"), addVegetable);
router.patch("/vegetables/:id", upload.single("image"), updateVegetable);
router.delete("/vegetables/:id", deleteVegetables);

module.exports = router;
