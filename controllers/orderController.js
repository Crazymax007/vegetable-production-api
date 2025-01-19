const Order = require("../schemas/orderSchema");
const { formatOrder } = require("../utils/formatList");

// ดึงข้อมูล Order ทั้งหมด
exports.getAllOrder = async (req, res) => {
    try {
      const { search, season } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
  
      const filter = {};
      if (season) filter.season = season;
      if (search) filter.vegetable = new RegExp(search, "i"); // ค้นหาแบบ Partial Match
  
      const orders = await Order.find(filter).skip(skip).limit(limit);
      const totalOrders = await Order.countDocuments(filter);
  
      res.status(200).json({
        message: "success",
        totalOrders,
        page,
        pageSize: orders.length,
        data: orders,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate farmerId ข้อมูลทั้งหมด
    const order = await Order.findById(id).populate("details.farmerId");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // จัดเรียงฟิลด์ใน response
    const formattedOrder = formatOrder(order.toObject());

    res.status(200).json({
      message: "success",
      data: formattedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
