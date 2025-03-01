const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// กำหนด schema สำหรับ Order
const orderSchema = new Schema(
  {
    orderDate: { type: Date, required: true }, // วันที่สั่งปลูก
    vegetable: {
      type: Schema.Types.ObjectId,
      ref: "Vegetable",
      required: true,
    }, // ชนิดของผักที่สั่ง
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer", // อ้างอิงจากโมเดล Buyer
      required: true,
    }, // ผู้ซื้อที่เกี่ยวข้อง
    season: {
      type: String,
      enum: ["Rain", "Summer"],
      required: true,
    }, // ฤดูการปลูก
    details: [
      {
        farmerId: {
          type: Schema.Types.ObjectId,
          ref: "Farmer",
          required: true,
        }, // ลูกสวนที่ปลูก
        quantityKg: { type: Number, required: true }, // จำนวนที่สั่งปลูก (กิโลกรัม)
        delivery: {
          actualKg: { type: Number, default: 0 }, // จำนวนที่ส่งจริง (กิโลกรัม)
          deliveredDate: { type: Date, default: null }, // วันที่ส่งจริง
          status: {
            type: String,
            enum: ["Pending", "Complete"],
            default: "Pending",
          }, // สถานะการส่ง
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
