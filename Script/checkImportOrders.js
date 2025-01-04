const mongoose = require("mongoose");
const connectMongoDB = require("../modules/database/mongoDB");
const Order = require("../schemas/orderSchema");

const verifyOrderDetailsCount = async () => {
  try {
    await connectMongoDB();

    // ดึงข้อมูลออเดอร์ทั้งหมด
    const allOrders = await Order.find();

    // คำนวณจำนวน `details` ทั้งหมดในทุกออเดอร์
    const totalDetailsCount = allOrders.reduce((total, order) => {
      return total + order.details.length; // นับจำนวน array ของ details
    }, 0);

    console.log(`Total details count: ${totalDetailsCount}`);
    console.log(`Expected details count: 5965`);

    if (totalDetailsCount === 5965) {
      console.log("✅ Data is complete and matches the original count.");
    } else {
      console.log(
        `❌ Data mismatch! Missing or extra records detected. Difference: ${5965 - totalDetailsCount}`
      );
    }
  } catch (error) {
    console.error("Error verifying data:", error);
  } finally {
    mongoose.disconnect();
  }
};

verifyOrderDetailsCount();
