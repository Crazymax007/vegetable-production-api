const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();

router.post("/predict", (req, res) => {
  const { plant } = req.body;

  if (!plant) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide a plant name" });
  }

  // เรียกใช้งาน Python script พร้อมส่งชื่อผักเป็น argument
  const pythonProcess = spawn("python", ["test_all.py", plant]);

  let dataToSend = "";
  let errorOutput = "";

  // รับข้อมูลจาก stdout ของ Python
  pythonProcess.stdout.on("data", (data) => {
    dataToSend += data.toString();
  });

  // รับข้อมูลจาก stderr (ถ้ามีข้อผิดพลาด)
  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  // ตรวจสอบเมื่อ Python script ทำงานเสร็จ
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      try {
        const jsonResponse = JSON.parse(dataToSend); // แปลงผลลัพธ์เป็น JSON object
        res.json({ success: true, output: jsonResponse });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: "Invalid JSON format from Python script",
        });
      }
    } else {
      res.status(500).json({ success: false, error: errorOutput });
    }
  });
});

module.exports = router;
