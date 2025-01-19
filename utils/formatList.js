const formatOrder = (order) => {
  return {
    _id: order._id,
    orderDate: order.orderDate,
    vegetable: order.vegetable,
    season: order.season,
    details: order.details.map((detail) => ({
      farmerId: formatFarmer(detail.farmerId),
      quantityKg: detail.quantityKg,
      delivery: {
        actualKg: detail.delivery.actualKg,
        deliveredDate: detail.delivery.deliveredDate,
        status: detail.delivery.status,
      },
      _id: detail._id,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    __v: order.__v,
  };
};

const formatFarmer = (farmer) => {
  if (!farmer) return null;
  return {
    _id: farmer._id,
    firstName: farmer.firstName,
    lastName: farmer.lastName,
    nickname: farmer.nickname,
    phone: farmer.phone,
    location: {
      latitude: farmer.location.latitude,
      longitude: farmer.location.longitude,
    },
    legacyId: farmer.legacyId,
    createdAt: farmer.createdAt,
    updatedAt: farmer.updatedAt,
    __v: farmer.__v,
  };
};

module.exports = { formatOrder, formatFarmer };
