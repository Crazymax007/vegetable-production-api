const express = require("express");
const router = express.Router();

const {
  addUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/userController");

router.post("/admin/user", addUser);
router.get("/admin/user", getUsers);
router.get("/admin/user/:id", getUserById);
router.put("/admin/user/:id", updateUserById);
router.delete("/admin/user/:id", deleteUserById);

module.exports = router;
