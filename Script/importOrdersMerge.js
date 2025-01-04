const fs = require("fs");
const connectMongoDB = require("../modules/database/mongoDB");
const Order = require("../schemas/orderSchema");
const Farmer = require("../schemas/farmerSchema");
const Vegetable = require("../schemas/vegetableSchema");
const mongoose = require("mongoose");

//รวมผักชนิดเดียวกันที่ปลูกวันเดียวกันเป็น order เดียวกัน
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

      // ค้นหาออเดอร์ที่มีอยู่แล้ว
      let existingOrder = await Order.findOne({
        orderDate: orderDate,
        vegetable: vegetable._id,
      });

      if (existingOrder) {
        // หากมีออเดอร์อยู่แล้ว ให้เพิ่ม details ใหม่
        const isFarmerInDetails = existingOrder.details.some(detail =>
          detail.farmerId.equals(farmer._id)
        );

        if (isFarmerInDetails) {
          console.log(`Farmer ${orderData.Name} already exists in this order.`);
        } else {
          existingOrder.details.push({
            farmerId: farmer._id,
            quantityKg: orderData.KG,
            delivery: {
              actualKg: orderData.KG,
              deliveredDate: orderDate,
              status: "Complete",
            },
          });
          await existingOrder.save();
          console.log(`Order for ${orderData.Name} merged into existing order.`);
        }
      } else {
        // หากยังไม่มีออเดอร์ ให้สร้างใหม่
        const newOrder = new Order({
          orderDate: orderDate,
          vegetable: vegetable._id,
          season: orderData.Season,
          details: [
            {
              farmerId: farmer._id,
              quantityKg: orderData.KG,
              delivery: {
                actualKg: orderData.KG,
                deliveredDate: orderDate,
                status: "Complete",
              },
            },
          ],
        });

        await newOrder.save();
        console.log(`New order for ${orderData.Name} created.`);
      }
    }
  } catch (error) {
    console.error("Error importing orders:", error);
  } finally {
    mongoose.disconnect();
  }
};

importOrders();
