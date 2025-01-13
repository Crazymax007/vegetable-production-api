const Farmer = require("../schemas/farmerSchema");
const User = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
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

    // ค้นหา User ในฐานข้อมูล
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // สร้าง payload สำหรับ JWT
    const payload = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };

    // สร้าง JWT Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      user: payload.user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

