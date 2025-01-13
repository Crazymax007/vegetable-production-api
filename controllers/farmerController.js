const Farmer = require("../schemas/farmerSchema");
const User = require("../schemas/userSchema");

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

exports.getFarmer = async (req, res) => {
  try {
    const farmers = await Farmer.find();
    const count = await Farmer.countDocuments();
    res.json({
      message: "getFarmer successfully",
      count,
      data: farmers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่า id มีรูปแบบที่ถูกต้องหรือไม่
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    // ค้นหาข้อมูลเกษตรกรโดยใช้ ID
    const farmer = await Farmer.findById(id);

    // กรณีไม่พบข้อมูล
    if (!farmer) {
      return res.status(404).json({
        status: "error",
        message: "Farmer not found",
      });
    }

    // ส่งข้อมูลกลับเมื่อสำเร็จ
    res.json({
      status: "success",
      message: "getFarmerById successfully",
      data: farmer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    // จัดการกรณีเกิดข้อผิดพลาด
    res.status(500).json({
      status: "error",
      message: "Server Error",
      error: {
        code: 500,
        detail: error.message,
      },
    });
  }
};

exports.updateFarmerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, nickname, phone, location } = req.body;

    // ตรวจสอบว่า id มีรูปแบบที่ถูกต้องหรือไม่
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    // ตรวจสอบว่าข้อมูลที่ส่งมาถูกต้องหรือไม่
    if (!firstName || !lastName) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: firstName, lastName, or phone",
      });
    }

    // อัปเดตข้อมูลเกษตรกร
    const farmer = await Farmer.findByIdAndUpdate(
      id,
      { firstName, lastName, nickname, phone, location },
      { new: true, runValidators: true }
    );

    // กรณีไม่พบข้อมูล
    if (!farmer) {
      return res.status(404).json({
        status: "error",
        message: "Farmer not found",
      });
    }

    // ส่งข้อมูลกลับเมื่อสำเร็จ
    res.json({
      status: "success",
      message: "updateFarmerById successfully",
      data: farmer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    // ตรวจสอบข้อผิดพลาดที่เกี่ยวกับการ validate
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        error: error.errors,
      });
    }

    // ข้อผิดพลาดทั่วไป
    res.status(500).json({
      status: "error",
      message: "Server Error",
      error: {
        code: 500,
        detail: error.message,
      },
    });
  }
};

exports.deleteFarmerById = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่า id มีรูปแบบที่ถูกต้องหรือไม่
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    // ตรวจสอบว่า Farmer มีอยู่หรือไม่
    const farmer = await Farmer.findById(id);
    if (!farmer) {
      return res.status(404).json({
        status: "error",
        message: "Farmer not found",
      });
    }
    // ลบ farmer
    await User.deleteMany({ farmerId: farmer._id });

    // ลบ User ที่เชื่อมโยงกับ Farmer
    const usersToDelete = await User.find({ farmerId: farmer._id });
    if (usersToDelete.length > 0) {
      await Farmer.findByIdAndDelete(id);
      console.log(`Deleted ${usersToDelete.length} users linked to farmer.`);
    }

    // ส่งข้อความยืนยันการลบ
    res.json({
      status: "success",
      message: "deleteFarmerById successfully",
      data: farmer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    // จัดการข้อผิดพลาดทั่วไป
    res.status(500).json({
      status: "error",
      message: "Server Error",
      error: {
        code: 500,
        detail: error.message,
      },
    });
  }
};
