const Farmer = require("../schemas/farmerSchema");

exports.addFarmer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      nickname = null,
      phone = "",
      location = null,
    } = req.body;

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

exports.addUser = (req, res) => {
  res.send("Hello register Backend");
};

exports.login = (req, res) => {
  res.send("Hello login Backend");
};
