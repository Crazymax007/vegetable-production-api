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

exports.getTopVegetablesByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!farmerId) {
      return res.status(400).json({ message: "Missing farmerId" });
    }

    // กำหนดช่วงวันที่สำหรับปี 2024
    const startOfYear = new Date("2024-01-01T00:00:00.000Z");
    const endOfYear = new Date("2024-12-31T23:59:59.999Z");

    // ดึงข้อมูล order ของลูกสวนนี้ เฉพาะที่มี orderDate อยู่ในปี 2024
    const orders = await Order.find({
      "details.farmerId": farmerId,
      orderDate: { $gte: startOfYear, $lte: endOfYear },
    })
      .populate("vegetable", "name imageUrl") // ✅ ดึง imageUrl ด้วย
      .lean();

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this farmer in 2024" });
    }

    // สร้าง Map เพื่อสรุปจำนวนกิโลกรัมที่ปลูกสำหรับผักแต่ละชนิด
    const vegetableMap = new Map();

    orders.forEach((order) => {
      order.details.forEach((detail) => {
        if (detail.farmerId.toString() === farmerId) {
          const vegName = order.vegetable.name;
          const vegImage = order.vegetable.imageUrl; // ✅ ดึง URL รูปภาพของผัก
          const quantity = detail.quantityKg;

          if (vegetableMap.has(vegName)) {
            let existing = vegetableMap.get(vegName);
            vegetableMap.set(vegName, {
              quantity: existing.quantity + quantity,
              imageUrl: vegImage, // ✅ เก็บ imageUrl
            });
          } else {
            vegetableMap.set(vegName, {
              quantity,
              imageUrl: vegImage, // ✅ เก็บ imageUrl
            });
          }
        }
      });
    });

    // แปลง Map เป็น Array และเรียงข้อมูลตามจำนวนกิโลกรัม
    const sortedVegetables = [...vegetableMap.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 3) // เอาแค่ 3 อันดับแรก
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        imageUrl: data.imageUrl || "/uploads/default.png", // ✅ ถ้าไม่มีรูป ใช้ default
      }));

    res.status(200).json({
      message: "success",
      farmerId,
      topVegetables: sortedVegetables,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
