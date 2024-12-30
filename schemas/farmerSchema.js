const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const farmerSchema = new Schema(
  {
    firstName: { type: String, required: true }, // ชื่อจริง
    lastName: { type: String, required: true }, // นามสกุล
    nickname: { type: String }, // ชื่อเล่น
    phone: { type: String }, // เบอร์โทรศัพท์
    location: {
      latitude: { type: Number }, // ละติจูด
      longitude: { type: Number }, // ลองจิจูด
    },
    legacyId: { type: String }, // ID จากข้อมูลเก่า
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farmer", farmerSchema);
