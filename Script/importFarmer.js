const connectMongoDB = require("../modules/database/mongoDB");
const Farmer = require("../schemas/farmerSchema");
const farmersData = require("../public/json/farmer.json");

// ฟังก์ชันแปลงข้อมูล
const transformData = (data) => {
  return data.map((item) => {
    const [firstName, lastName] = item.Name.split(" ");
    return {
      firstName,
      lastName,
      nickname: item.Nickname,
      phone: item.Phone,
      location: {
        latitude: item.latitude,
        longitude: item.longitude,
      },
      legacyId: item.Id,
    };
  });
};

// ฟังก์ชันนำเข้าข้อมูล
const importFarmers = async () => {
  try {
    await connectMongoDB(); // เชื่อมต่อ MongoDB
    const transformedData = transformData(farmersData);

    // เพิ่มข้อมูล
    await Farmer.insertMany(transformedData);
    console.log("Farmers added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error importing farmers:", error);
    process.exit(1);
  }
};

importFarmers();
