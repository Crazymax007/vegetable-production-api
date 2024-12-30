const fs = require("fs");
const connectMongoDB = require("../modules/database/mongoDB");
const Order = require("../schemas/orderSchema");
const Farmer = require("../schemas/farmerSchema");
const Vegetable = require("../schemas/vegetableSchema");
const mongoose = require("mongoose");

const importOrders = async () => {
  try {
    await connectMongoDB();

    const rawData = fs.readFileSync("D:/learningNode.js/Back-End_Project/public/json/order.json");
    const ordersData = JSON.parse(rawData);

    for (const orderData of ordersData) {
      // ค้นหาข้อมูลเกษตรกรจากชื่อ
      const farmer = await Farmer.findOne({
        firstName: orderData.Name.split(" ")[0],
        lastName: orderData.Name.split(" ")[1],
      });

      if (!farmer) {
        console.log(`Farmer ${orderData.Name} not found.`);
        continue;
      }

      // ค้นหาผักจากชื่อ
      const vegetable = await Vegetable.findOne({ name: orderData.Plant });

      if (!vegetable) {
        console.log(`Vegetable ${orderData.Plant} not found.`);
        continue;
      }

      // แปลงวันที่จาก "dd/mm/yyyy" เป็น "yyyy-mm-dd"
      const dateParts = orderData.Date.split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      const orderDate = new Date(formattedDate);

      if (isNaN(orderDate)) {
        console.log(`Invalid date format: ${orderData.Date}`);
        continue;
      }

      // สร้าง Order ใหม่
      const newOrder = new Order({
        orderDate: orderDate,
        vegetable: vegetable._id, // เชื่อมโยงกับ ID ของผัก
        season: orderData.Season,
        details: [
          {
            farmerId: farmer._id, // เชื่อมโยงกับ ID ของเกษตรกร
            quantityKg: orderData.KG,
            delivery: {
              actualKg: orderData.KG, // ใช้ค่าเดียวกับ quantityKg
              deliveredDate: orderDate, // ใช้วันที่เดียวกับ orderDate
              status: "Complete", // ตั้งค่าเป็น Complete
            },
          },
        ],
      });

      // บันทึกข้อมูลออเดอร์
      await newOrder.save();
      console.log(`Order for ${orderData.Name} added.`);
    }
  } catch (error) {
    console.error("Error importing orders:", error);
  } finally {
    mongoose.disconnect();
  }
};

importOrders();
