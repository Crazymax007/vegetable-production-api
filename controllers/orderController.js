const Order = require("../schemas/orderSchema");
const mongoose = require("mongoose");
const Vegetable = require("../schemas/vegetableSchema");

mongoose.set("strictPopulate", false); // เปิดใช้งาน strictPopulate false

exports.getTopVegetablesByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!farmerId) {
      return res.status(400).json({ message: "Missing farmerId" });
    }

    // ✅ ใช้ปี 2024 เป็นค่าเริ่มต้น
    const year = 2024;

    // ✅ โค้ดสำหรับใช้ปีปัจจุบัน
    // const currentYear = new Date().getFullYear();
    // const year = currentYear;

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    // ดึงข้อมูล order ของลูกสวนนี้ เฉพาะที่มี orderDate อยู่ในปีที่กำหนด
    const orders = await Order.find({
      "details.farmerId": farmerId,
      orderDate: { $gte: startOfYear, $lte: endOfYear },
    })
      .populate("vegetable", "name imageUrl")
      .lean();

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: `No orders found for this farmer in ${year}` });
    }

    // สร้าง Map เพื่อสรุปจำนวนกิโลกรัมที่ส่งจริง (`actualKg`) สำหรับผักแต่ละชนิด
    const vegetableMap = new Map();

    orders.forEach((order) => {
      order.details.forEach((detail) => {
        if (detail.farmerId.toString() === farmerId) {
          const actualKg = detail.delivery?.actualKg || 0;
          if (actualKg > 0) {
            const vegName = order.vegetable.name;
            const vegImage = order.vegetable.imageUrl;

            if (vegetableMap.has(vegName)) {
              let existing = vegetableMap.get(vegName);
              vegetableMap.set(vegName, {
                quantity: existing.quantity + actualKg,
                imageUrl: vegImage,
              });
            } else {
              vegetableMap.set(vegName, {
                quantity: actualKg,
                imageUrl: vegImage,
              });
            }
          }
        }
      });
    });

    // ถ้าไม่มีข้อมูลที่ actualKg > 0 ส่ง 404 กลับไป
    if (vegetableMap.size === 0) {
      return res.status(404).json({
        message: `No delivered vegetables found for this farmer in ${year}`,
      });
    }

    // แปลง Map เป็น Array และเรียงข้อมูลตาม actualKg
    const sortedVegetables = [...vegetableMap.entries()]
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 3) // เอาแค่ 3 อันดับแรก
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        imageUrl: data.imageUrl || "/uploads/default.png",
      }));

    res.status(200).json({
      message: "success",
      farmerId,
      year, // ✅ ส่งปีที่ใช้ไปด้วย
      topVegetables: sortedVegetables,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("vegetable", "name")
      .populate("buyer", "name contact")
      .populate("details.farmerId", "firstName lastName")
      .lean();

    res.status(200).json({
      message: "success",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await Order.findById(orderId)
      .populate("vegetable", "name")
      .populate("buyer", "name contact")
      .populate("details.farmerId", "firstName lastName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "success",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      orderDate, // วันที่สั่งปลูก
      vegetableId, // ObjectId ของผักที่สั่ง
      buyerId, // ObjectId ของผู้ซื้อ
      details, // รายละเอียดของการสั่งซื้อ (ข้อมูลเกษตรกรและจำนวน)
      dueDate, // วันที่กำหนดส่ง
    } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    if (
      !orderDate ||
      !vegetableId ||
      !buyerId ||
      !details ||
      details.length === 0 ||
      !dueDate // ตรวจสอบวันที่กำหนดส่ง
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // คำนวณฤดูจาก orderDate
    const month = new Date(orderDate).getMonth() + 1; // getMonth() เริ่มจาก 0
    const season = month >= 2 && month <= 5 ? "Summer" : "Rain";

    // สร้าง Object สำหรับ Order
    const newOrder = new Order({
      orderDate,
      vegetable: vegetableId,
      buyer: buyerId,
      season, // ใช้ค่าที่คำนวณได้
      details,
      dueDate, // เพิ่ม dueDate
    });

    // บันทึก Order ลงในฐานข้อมูล
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let isUpdated = false;

    // ✅ อัปเดตข้อมูลทั่วไป
    if (updateData.orderDate !== undefined) {
      order.orderDate = updateData.orderDate;
      isUpdated = true;
    }
    if (updateData.vegetable !== undefined) {
      order.vegetable = updateData.vegetable;
      isUpdated = true;
    }
    if (updateData.buyerId !== undefined) {
      order.buyerId = updateData.buyerId; // อัปเดต buyerId
      isUpdated = true;
    }
    if (updateData.season !== undefined) {
      order.season = updateData.season;
      isUpdated = true;
    }

    // ✅ อัปเดต `details` แบบลึก
    if (updateData.details && Array.isArray(updateData.details)) {
      updateData.details.forEach((updateDetail) => {
        const existingDetail = order.details.find(
          (d) => d._id.toString() === updateDetail._id
        );

        if (existingDetail) {
          if (updateDetail.quantityKg !== undefined) {
            existingDetail.quantityKg = updateDetail.quantityKg;
            isUpdated = true;
          }
          if (updateDetail.delivery) {
            if (updateDetail.delivery.actualKg !== undefined) {
              existingDetail.delivery.actualKg = updateDetail.delivery.actualKg;
              isUpdated = true;
            }
            if (updateDetail.delivery.deliveredDate !== undefined) {
              existingDetail.delivery.deliveredDate =
                updateDetail.delivery.deliveredDate;
              isUpdated = true;
            }
            if (updateDetail.delivery.status !== undefined) {
              existingDetail.delivery.status = updateDetail.delivery.status;
              isUpdated = true;
            }
          }
        }
      });

      order.markModified("details"); // 🔥 บอก Mongoose ว่า details ถูกแก้ไข
    }

    if (!isUpdated) {
      return res.status(400).json({ message: "No updates were made" });
    }

    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteOrderDetail = async (req, res) => {
  try {
    const { orderId, detailId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ลบ detail ที่ต้องการ
    order.details = order.details.filter(
      (detail) => detail._id.toString() !== detailId
    );

    // ถ้าไม่มี details เหลือเลย ให้ลบ order ทั้งหมด
    if (order.details.length === 0) {
      await Order.findByIdAndDelete(orderId);
      return res.status(200).json({ message: "Order deleted successfully" });
    }

    await order.save();
    res.status(200).json({ message: "Order detail deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params; // รับค่า orderId จาก URL

    console.log(orderId);
    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    // ลบ Order ที่มี orderId ที่ระบุ
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
