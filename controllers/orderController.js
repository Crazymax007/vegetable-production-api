const Order = require("../schemas/orderSchema");
const mongoose = require("mongoose");
const Vegetable = require("../schemas/vegetableSchema");
const { formatOrder } = require("../utils/formatList");

// ดึงข้อมูล Order ทั้งหมด
exports.getAllOrder = async (req, res) => {
  try {
    const {
      search, // ชื่อผักหรือ ObjectId
      season, // ฤดู
      farmerId, // ไอดีของลูกสวน
      quantity, // จำนวนที่กำหนด
      actualKg, // จำนวนที่ส่งจริง
      status, // สถานะการส่ง
      orderDate, // วันที่สั่งปลูก
    } = req.query;

    const limit = parseInt(req.query.limit) || 10; // กำหนดจำนวนข้อมูลต่อครั้ง

    const filter = {};
    if (season) filter.season = season;

    // ตรวจสอบว่า search เป็น ObjectId หรือไม่
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter.vegetable = search; // ใช้ ObjectId โดยตรง
      } else {
        filter.vegetable = new RegExp(search, "i"); // ค้นหาแบบ Partial Match
      }
    }

    if (orderDate) {
      const parsedDate = new Date(orderDate);
      if (!isNaN(parsedDate)) {
        const startOfDay = new Date(parsedDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(parsedDate.setUTCHours(23, 59, 59, 999));
        filter.orderDate = { $gte: startOfDay, $lt: endOfDay };
      } else {
        return res.status(400).json({ message: "Invalid orderDate format" });
      }
    }

    // ค้นหาใน details
    if (farmerId || quantity || actualKg || status) {
      filter.details = { $elemMatch: {} };
      if (farmerId) filter.details.$elemMatch.farmerId = farmerId;
      if (quantity)
        filter.details.$elemMatch.quantityKg = { $gte: parseFloat(quantity) };
      if (actualKg)
        filter.details.$elemMatch["delivery.actualKg"] = {
          $gte: parseFloat(actualKg),
        };
      if (status) filter.details.$elemMatch["delivery.status"] = status;
    }

    const orders = await Order.find(filter)
      .populate("vegetable", "name") // แสดงชื่อผัก
      .populate("details.farmerId", "name") // แสดงชื่อคน
      .limit(limit); // ดึงข้อมูลโดยมีการจำกัดจำนวน

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      message: "success",
      totalOrders,
      pageSize: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ! ยังไม่ได้เทสนะครับผม
// exports.updateOrder = async (req, res) => {
//   try {
//     const { id } = req.params; // รับ ID ของ Order ที่ต้องการแก้ไข
//     const updates = req.body; // ข้อมูลที่ต้องการแก้ไข

//     // ตรวจสอบว่า ID เป็น ObjectId ที่ถูกต้องหรือไม่
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid Order ID" });
//     }

//     // อัปเดตข้อมูล Order
//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true, runValidators: true } // new: คืนค่าเอกสารที่อัปเดตแล้ว, runValidators: ตรวจสอบความถูกต้องของข้อมูล
//     )
//       .populate("vegetable", "name")
//       .populate("details.farmerId", "name");

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({
//       message: "Order updated successfully",
//       data: updatedOrder,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ลบ Order
// exports.deleteOrder = async (req, res) => {
//   try {
//     const { id } = req.params; // รับ ID ของ Order ที่ต้องการลบ

//     // ตรวจสอบว่า ID เป็น ObjectId ที่ถูกต้องหรือไม่
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid Order ID" });
//     }

//     // ลบ Order
//     const deletedOrder = await Order.findByIdAndDelete(id);

//     if (!deletedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({
//       message: "Order deleted successfully",
//       data: deletedOrder,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
