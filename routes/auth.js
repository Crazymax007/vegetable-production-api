const express = require("express");
const router = express.Router();

const { login, logout, getUserInfo } = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", verifyToken, getUserInfo);

module.exports = router;
