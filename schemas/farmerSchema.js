const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const farmerSchema = new Schema(
  {
    firstName: { type: String, required: true }, // ชื่อจริง
    lastName: { type: String, required: true }, // นามสกุล
    nickname: { type: String, default: null }, // ชื่อเล่น
    phone: { type: String, default: null }, // เบอร์โทรศัพท์
    location: {
      latitude: { type: Number, default: null }, // ละติจูด
      longitude: { type: Number, default: null }, // ลองจิจูด
    },
    legacyId: { type: String, default: null }, // ID จากข้อมูลเก่า
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
