const express = require("express");
const router = express.Router();

const { addUser} = require("../controllers/userController");

router.post("/admin/user", addUser);

module.exports = router;
