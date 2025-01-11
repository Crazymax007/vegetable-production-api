const fs = require("fs");
const connectMongoDB = require("../modules/database/mongoDB");
const Vegetable = require("../schemas/vegetableSchema");
const mongoose = require("mongoose");

const importVegetables = async () => {
  try {
    // เชื่อมต่อ MongoDB
    await connectMongoDB();

    // อ่านข้อมูลจากไฟล์ order.json
    const rawData = fs.readFileSync("D:/Github/Back-End_Project/public/json/order.json");
    const ordersData = JSON.parse(rawData);

    // สร้างลิสต์ผักที่ไม่ซ้ำจากข้อมูลใน ordersData
    const vegetableNames = [
      ...new Set(ordersData.map((order) => order.Plant)),
    ];

    // เพิ่มข้อมูลผักใน collection 'Vegetable' หากยังไม่มี
    for (const vegetableName of vegetableNames) {
      const existingVegetable = await Vegetable.findOne({
        name: vegetableName,
      });
      if (!existingVegetable) {
        const newVegetable = new Vegetable({ name: vegetableName });
        await newVegetable.save();
        console.log(`Vegetable ${vegetableName} added.`);
      } else {
        console.log(`Vegetable ${vegetableName} already exists.`);
      }
    }
  } catch (error) {
    console.error("Error importing vegetables:", error);
  } finally {
    mongoose.disconnect();
  }
};

importVegetables();
