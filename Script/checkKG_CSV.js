const mongoose = require("mongoose");
const connectMongoDB = require("../modules/database/mongoDB");
const Order = require("../schemas/orderSchema");
const fs = require("fs");
const Vegetable = require("../schemas/vegetableSchema");
const path = require("path");

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

    // สร้างข้อมูล CSV
    let csvContent = "Vegetable Name,Total Quantity (Kg)\n"; // หัวข้อ CSV
    for (const vegetable in aggregatedData) {
      csvContent += `${vegetable},${aggregatedData[vegetable]}\n`;
    }

    // เขียนข้อมูล CSV ลงไฟล์
    const filePath = path.join(__dirname, "vegetable_totals.csv");
    fs.writeFileSync(filePath, csvContent);

    console.log(`CSV file created successfully at ${filePath}`);
  } catch (error) {
    console.error("Error aggregating vegetable quantities:", error);
  } finally {
    mongoose.disconnect();
  }
};

aggregateTotalKgByVegetable();
