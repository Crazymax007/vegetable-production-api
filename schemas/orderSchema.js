const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    orderDate: { type: Date, required: true },
    vegetable: {
      type: Schema.Types.ObjectId,
      ref: "Vegetable",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    season: {
      type: String,
      enum: ["Rain", "Summer"],
      required: true,
    },
    details: [
      {
        farmerId: {
          type: Schema.Types.ObjectId,
          ref: "Farmer",
          required: true,
        },
        quantityKg: { type: Number, required: true },
        delivery: {
          actualKg: { type: Number, default: 0 },
          deliveredDate: { type: Date, default: null },
          status: {
            type: String,
            enum: ["Pending", "Complete"],
            default: "Pending",
          },
        },
      },
    ],
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
