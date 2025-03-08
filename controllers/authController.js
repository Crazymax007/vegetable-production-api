const User = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // ค้นหา User ในฐานข้อมูล
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    // สร้าง JWT
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      farmerId: user.farmerId, 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ส่ง Cookie ที่ปลอดภัย
    res.cookie("token", token, {
      httpOnly: true, // ป้องกันการเข้าถึงผ่าน JavaScript
      secure: process.env.NODE_ENV === "production", // ใช้ secure เฉพาะใน Production
      sameSite: "strict", // ป้องกันการส่ง Cookie ระหว่าง Cross-Site
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getUserInfo = async (req, res) => {
  const { id, username, role, farmerId } = req.user; // ดึงข้อมูลจาก Middleware verifyToken

  // ถ้า role เป็น 'farmer'
  if (role === "farmer") {
    // เช็คว่ามีการเชื่อมโยงกับ Farmer หรือไม่
    return res.status(200).json({
      id,
      username,
      role,
      farmerId,
    });
  }

  // ถ้าไม่ใช่ role 'farmer' ก็แสดงข้อมูลทั่วไป
  res.status(200).json({
    id,
    username,
    role,
  });
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ใช้ secure ใน Production
      sameSite: "strict", // ป้องกัน Cross-Site Cookie
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during logout" });
  }
};
