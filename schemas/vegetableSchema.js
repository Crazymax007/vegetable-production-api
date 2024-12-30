const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vegetableSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // ชื่อผัก
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vegetable", vegetableSchema);
