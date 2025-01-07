const fs = require("fs");
const connectMongoDB = require("../modules/database/mongoDB");
const Order = require("../schemas/orderSchema");
const Farmer = require("../schemas/farmerSchema");
const Vegetable = require("../schemas/vegetableSchema");
const mongoose = require("mongoose");

const importOrders = async () => {
  try {
    await connectMongoDB();

    const rawData = fs.readFileSync("D:/Github/Back-End_Project/public/json/order.json");
    const ordersData = JSON.parse(rawData);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < ordersData.length; i++) {
      const orderData = ordersData[i];
      try {
        // ค้นหาข้อมูลเกษตรกรจาก firstname และ lastname
        const farmer = await Farmer.findOne({
          firstName: orderData.firstname,
          lastName: orderData.lastname,
        });

        if (!farmer) {
          console.log(`Error: Farmer ${orderData.firstname} ${orderData.lastname} not found in order #${i + 1}.`);
          errorCount++;
          continue;
        }

        // ค้นหาผักจากชื่อ
        const vegetable = await Vegetable.findOne({ name: orderData.Plant });

        if (!vegetable) {
          console.log(`Error: Vegetable ${orderData.Plant} not found in order #${i + 1}.`);
          errorCount++;
          continue;
        }

        // แปลงวันที่จาก "dd/mm/yyyy" เป็น "yyyy-mm-dd"
        const dateParts = orderData.Date.split('/');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const orderDate = new Date(formattedDate);

        if (isNaN(orderDate)) {
          console.log(`Error: Invalid date format for ${orderData.Date} in order #${i + 1}.`);
          errorCount++;
          continue;
        }

        // ค้นหาออเดอร์ที่มีอยู่แล้วในวันที่และผักเดียวกัน
        let existingOrder = await Order.findOne({
          orderDate: orderDate,
          vegetable: vegetable._id,
        });

        if (existingOrder) {
          // หากมีออเดอร์อยู่แล้ว ให้เพิ่มรายละเอียดใหม่
          const detailIndex = existingOrder.details.findIndex(detail =>
            detail.farmerId.equals(farmer._id)
          );

          if (detailIndex !== -1) {
            // ถ้ามีเกษตรกรในรายการนี้แล้ว ให้บวกปริมาณกิโลกรัม
            existingOrder.details[detailIndex].quantityKg += orderData.KG;
            existingOrder.details[detailIndex].delivery.actualKg += orderData.KG;
            await existingOrder.save();
            console.log(`Updated order for ${orderData.firstname} ${orderData.lastname} in order #${i + 1}.`);
          } else {
            // ถ้าไม่พบเกษตรกร ให้เพิ่มเข้าไปในรายละเอียด
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
            console.log(`Order for ${orderData.firstname} ${orderData.lastname} added to existing order #${i + 1}.`);
          }
          successCount++;
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
          console.log(`New order for ${orderData.firstname} ${orderData.lastname} created in order #${i + 1}.`);
          successCount++;
        }
      } catch (innerError) {
        console.error(`Unexpected error in order #${i + 1}: ${innerError.message}`);
        errorCount++;
      }
    }

    console.log(`\nSummary: ${successCount} orders added successfully, ${errorCount} errors.`);
  } catch (error) {
    console.error("Error importing orders:", error);
  } finally {
    mongoose.disconnect();
  }
};

importOrders();
