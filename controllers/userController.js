const Farmer = require("../schemas/farmerSchema");
const User = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.addUser = async (req, res) => {
    try {
      const { username, password, role, farmerId } = req.body;
  
      if (!username) {
        return res.status(400).json({
          message: "Username is required",
        });
      }
      if (!password) {
        return res.status(400).json({
          message: "Password is required",
        });
      }
      if (!role || !["admin", "manager", "farmer"].includes(role)) {
        return res.status(400).json({
          message: "Role is invalid or required",
        });
      }
  
      // เช็คว่าถ้าเป็น farmer จ้ะต้องมี farmerId ด้วย
      if (role === "farmer" && !farmerId) {
        return res.status(400).json({
          message: "Farmer ID is required for role 'farmer'",
        });
      }
  
      // ตรวจสอบว่า farmerId ที่ส่งมามีอยู่ในฐานข้อมูลหรือไม่
      if (farmerId) {
        const farmerExists = await Farmer.findById(farmerId);
        if (!farmerExists) {
          return res.status(404).json({
            message: "Farmer ID not found",
          });
        }
      }
  
      // ตรวจสอบว่า username ซ้ำหรือไม่
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({
          message: "Username already exists",
        });
      }
  
      // เข้ารหัส password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        farmerId: role === "farmer" ? farmerId : null, 
      });
  
      await newUser.save();
  
      res.status(201).json({
        message: "User added successfully",
        data: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role,
          farmerId: newUser.farmerId,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };