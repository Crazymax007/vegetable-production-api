const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true }, // ชื่อผู้ใช้
    password: { type: String, required: true }, // รหัสผ่าน
    role: {
      type: String,
      enum: ["admin", "manager", "farmer"],
      required: true,
    }, // สิทธิ์ของผู้ใช้
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: false,
    }, // หาก user เป็นลูกสวน จะเชื่อมโยงกับ Farmer
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
