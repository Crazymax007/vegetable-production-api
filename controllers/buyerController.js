const Buyer = require("../schemas/buyerSchema");

// ✅ เรียกดู Buyer ทั้งหมด
exports.getBuyer = async (req, res) => {
  try {
    const buyers = await Buyer.find();
    res.json({
      message: "success",
      buyers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ เรียกดู Buyer ด้วย ID
exports.getBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }
    res.json({ message: "success", buyer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ เพิ่ม Buyer
exports.addBuyer = async (req, res) => {
  const { name, contact } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const existingBuyer = await Buyer.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingBuyer) {
      return res
        .status(400)
        .json({ message: "Buyer with this name already exists" });
    }

    const newBuyer = new Buyer({ name, contact });
    await newBuyer.save();
    res.status(201).json(newBuyer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ อัพเดทข้อมูล Buyer ด้วย ID
exports.updateBuyer = async (req, res) => {
  const { name, contact } = req.body;

  try {
    // ค้นหาและอัพเดทข้อมูล Buyer
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      req.params.id,
      { name, contact },
      { new: true } // กำหนดให้คืนค่าผลลัพธ์เป็นข้อมูลที่อัพเดทแล้ว
    );

    if (!updatedBuyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // ส่งข้อมูลที่อัพเดทแล้วกลับไป
    res.json(updatedBuyer);
  } catch (err) {
    // กรณีเกิดข้อผิดพลาด
    res.status(500).json({ message: err.message });
  }
};

// ✅ ลบ Buyer ด้วย ID
// ✅ ลบข้อมูล Buyer ด้วย ID
exports.deleteBuyer = async (req, res) => {
  try {
    // ค้นหาข้อมูล Buyer และลบ
    const buyer = await Buyer.findByIdAndDelete(req.params.id);

    // หากไม่พบ Buyer
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // ส่งข้อความเมื่อการลบสำเร็จ พร้อมข้อมูลของ Buyer ที่ถูกลบ
    res.json({ 
      message: "success", 
      deletedBuyer: buyer
    });
  } catch (err) {
    // กรณีเกิดข้อผิดพลาดจาก server
    res.status(500).json({ message: err.message });
  }
};

