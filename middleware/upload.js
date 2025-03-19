const multer = require("multer");
const path = require("path");

// กำหนด Storage สำหรับการอัปโหลด
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // เก็บไฟล์ไว้ในโฟลเดอร์ uploads/
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // ตั้งชื่อไฟล์ใหม่
  },
});

// ตรวจสอบประเภทไฟล์ (เฉพาะภาพ)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// กำหนด multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB
  fileFilter: fileFilter,
});

module.exports = upload;
