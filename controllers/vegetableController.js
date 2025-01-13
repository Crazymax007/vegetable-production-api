const Vegetable = require("../schemas/vegetableSchema");

exports.getVegetables = async (req, res) => {
  try {
    const vegetables = await Vegetable.find();
    console.log(vegetables);
    res.status(200).json({
      message: "success",
      data: vegetables,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ดึงข้อมูลผักตาม ID
exports.getVegetablesById = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่า ID ถูกต้องหรือไม่
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const vegetable = await Vegetable.findById(id);

    if (!vegetable) {
      return res.status(404).json({
        message: "Vegetable not found",
      });
    }

    res.status(200).json({
      message: "GET VegetablesById",
      data: vegetable,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// เพิ่มข้อมูลผัก
exports.addVegetable = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Vegetable name is required",
      });
    }

    const existingVegetable = await Vegetable.findOne({ name });
    if (existingVegetable) {
      return res.status(409).json({
        message: "Vegetable already exists",
      });
    }

    const newVegetable = new Vegetable({ name });
    await newVegetable.save();

    res.status(201).json({
      message: "Vegetable added successfully",
      data: newVegetable,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// อัปเดตข้อมูลผัก
exports.updateVegetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Vegetable name is required",
      });
    }

    const updatedVegetable = await Vegetable.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedVegetable) {
      return res.status(404).json({
        message: "Vegetable not found",
      });
    }

    res.status(200).json({
      message: "Vegetable updated successfully",
      data: updatedVegetable,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ลบข้อมูลผัก
exports.deleteVegetables = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const deletedVegetable = await Vegetable.findByIdAndDelete(id);

    if (!deletedVegetable) {
      return res.status(404).json({
        message: "Vegetable not found",
      });
    }

    res.status(200).json({
      message: "Vegetable deleted successfully",
      data: deletedVegetable,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
