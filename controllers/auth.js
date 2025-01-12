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

exports.addFarmer = async (req, res) => {
  try {
    const { firstName, lastName, nickname, phone, location } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
    if (!firstName) {
      return res.status(400).json({
        message: "First Name is required",
      });
    }
    if (!lastName) {
      return res.status(400).json({
        message: "Last Name is required",
      });
    }

    // ตรวจสอบว่าข้อมูลซ้ำหรือไม่
    const existingFarmer = await Farmer.findOne({ firstName, lastName });
    if (existingFarmer) {
      return res.status(409).json({
        message: "Farmer already exists",
      });
    }

    // สร้างข้อมูลใหม่
    const newFarmer = new Farmer({
      firstName,
      lastName,
      nickname,
      phone,
      location,
    });

    await newFarmer.save();

    res.json({
      message: "Farmer added successfully",
      data: newFarmer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

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
