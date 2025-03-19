const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Buyer", buyerSchema);
