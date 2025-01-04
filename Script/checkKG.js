const mongoose = require("mongoose");
const connectMongoDB = require("../modules/database/mongoDB");
const Order = require("../schemas/orderSchema");
const Vegetable = require("../schemas/vegetableSchema");

const aggregateTotalKgByVegetable = async () => {
  try {
    await connectMongoDB();

    // หาข้อมูลออเดอร์ทั้งหมดที่มีในฐานข้อมูล
    const orders = await Order.find({}).populate("vegetable").exec();

    // สร้าง Object เพื่อเก็บผลรวมของ quantityKg สำหรับผักแต่ละชนิด
    const aggregatedData = {};

    for (const order of orders) {
      // สำหรับแต่ละออเดอร์
      order.details.forEach((detail) => {
        const vegetableName = order.vegetable.name; // ชื่อผัก

        // ถ้ายังไม่มีการรวมค่า quantityKg ของผักชนิดนี้ใน aggregatedData ให้สร้างใหม่
        if (!aggregatedData[vegetableName]) {
          aggregatedData[vegetableName] = 0;
        }

        // รวม quantityKg ของผักชนิดนี้
        aggregatedData[vegetableName] += detail.quantityKg;
      });
    }

    // แสดงผลลัพธ์ที่รวม quantityKg ของผักแต่ละชนิดทั้งหมดในฐานข้อมูล
    console.log("Total quantityKg for each vegetable:");
    for (const vegetable in aggregatedData) {
      console.log(`${vegetable}, Kg: ${aggregatedData[vegetable]}`);
    }

  } catch (error) {
    console.error("Error aggregating vegetable quantities:", error);
  } finally {
    mongoose.disconnect();
  }
};

aggregateTotalKgByVegetable();
