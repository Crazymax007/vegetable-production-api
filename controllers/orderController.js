const Order = require("../schemas/orderSchema");
const mongoose = require("mongoose");
const Vegetable = require("../schemas/vegetableSchema");

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
    } = req.body;

    const limit = parseInt(req.query.limit) || 0; // กำหนดจำนวนข้อมูลต่อครั้ง

    const filter = {};
    if (season) filter.season = season;

    // ค้นหาผักจากชื่อก่อน ถ้า search เป็นชื่อผัก
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        // ถ้าเป็น ObjectId ให้ค้นหาโดยใช้ ObjectId
        filter.vegetable = search;
      } else {
        // ค้นหาผักจากชื่อ
        const vegetable = await Vegetable.findOne({
          name: new RegExp(search, "i"),
        });
        if (vegetable) {
          filter.vegetable = vegetable._id; // ใช้ ObjectId ของผักที่ค้นพบ
        } else {
          return res.status(404).json({ message: "Vegetable not found" });
        }
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
      .populate("details.farmerId", "firstName lastName") // แสดงชื่อและนามสกุลของเกษตรกร
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

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await Order.findById(orderId)
      .populate("vegetable", "name")
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

// สร้าง Order
exports.createOrder = async (req, res) => {
  try {
    const {
      orderDate, // วันที่สั่งปลูก
      vegetableId, // ObjectId ของผักที่สั่ง
      season, // ฤดูการปลูก
      details, // รายละเอียดของการสั่งซื้อ (ข้อมูลเกษตรกรและจำนวน)
    } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    if (
      !orderDate ||
      !vegetableId ||
      !season ||
      !details ||
      details.length === 0
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // สร้าง Object สำหรับ Order
    const newOrder = new Order({
      orderDate,
      vegetable: vegetableId,
      season,
      details,
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

// update Order ทั้งหมด
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

// exports.Confarm = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const updateData = req.body;

//     if (!orderId) {
//       return res.status(400).json({ message: "Missing orderId" });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     let isUpdated = false;

//     // ✅ อัปเดตข้อมูลทั่วไป
//     if (updateData.orderDate !== undefined) {
//       order.orderDate = updateData.orderDate;
//       isUpdated = true;
//     }
//     if (updateData.vegetable !== undefined) {
//       order.vegetable = updateData.vegetable;
//       isUpdated = true;
//     }
//     if (updateData.season !== undefined) {
//       order.season = updateData.season;
//       isUpdated = true;
//     }

//     // ✅ อัปเดต `details` แบบลึก
//     if (updateData.details && Array.isArray(updateData.details)) {
//       updateData.details.forEach((updateDetail) => {
//         const existingDetail = order.details.find(
//           (d) => d._id.toString() === updateDetail._id
//         );

//         if (existingDetail) {
//           if (updateDetail.quantityKg !== undefined) {
//             existingDetail.quantityKg = updateDetail.quantityKg;
//             isUpdated = true;
//           }
//           if (updateDetail.delivery) {
//             if (updateDetail.delivery.actualKg !== undefined) {
//               existingDetail.delivery.actualKg = updateDetail.delivery.actualKg;
//               isUpdated = true;
//             }
//             if (updateDetail.delivery.deliveredDate !== undefined) {
//               existingDetail.delivery.deliveredDate =
//                 updateDetail.delivery.deliveredDate;
//               isUpdated = true;
//             }
//             if (updateDetail.delivery.status !== undefined) {
//               existingDetail.delivery.status = updateDetail.delivery.status;
//               isUpdated = true;
//             }
//           }
//         }
//       });

//       order.markModified("details"); // 🔥 บอก Mongoose ว่า details ถูกแก้ไข
//     }

//     if (!isUpdated) {
//       return res.status(400).json({ message: "No updates were made" });
//     }

//     order.updatedAt = new Date();
//     await order.save();

//     res.status(200).json({
//       message: "Order updated successfully",
//       order,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
