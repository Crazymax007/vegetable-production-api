const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();

router.post("/predict", (req, res) => {
  const { plant, required_kg, num_farmers } = req.body;

  if (!plant || !required_kg || !num_farmers) {
    return res
      .status(400)
      .json({ success: false, error: "Missing parameters" });
  }

  // เรียกใช้ Python script พร้อมส่ง argument
  const pythonProcess = spawn("python", [
    "predict.py",
    plant,
    required_kg,
    num_farmers,
  ]);

  let dataToSend = "";
  let errorOutput = "";

  // รับข้อมูลจาก stdout ของ Python script
  pythonProcess.stdout.on("data", (data) => {
    dataToSend += data.toString();
  });

  // รับข้อมูล error จาก stderr
  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  // ตรวจสอบเมื่อ Python script ทำงานเสร็จ
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      try {
        const jsonResponse = JSON.parse(dataToSend);

        // ปรับค่าผลลัพธ์ให้ไม่เกิน Max_Actual_KG
        jsonResponse.forEach((farmer) => {
          if (farmer.Adjusted_Predicted_KG > farmer.Max_Actual_KG) {
            farmer.Adjusted_Predicted_KG = farmer.Max_Actual_KG;
          }
        });

        // ตรวจสอบผลรวมของ Adjusted_Predicted_KG ให้ตรงกับ required_kg
        let totalKg = jsonResponse.reduce(
          (sum, farmer) => sum + farmer.Adjusted_Predicted_KG,
          0
        );
        const diff = required_kg - totalKg;

        if (diff !== 0) {
          // ปรับผลลัพธ์สุดท้ายเพื่อให้ตรงกับ required_kg
          jsonResponse.sort(
            (a, b) => b.Adjusted_Predicted_KG - a.Adjusted_Predicted_KG
          );
          jsonResponse[0].Adjusted_Predicted_KG += diff;
        }

        res.json({ success: true, data: jsonResponse });
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
router.post("/check-available-farmers", (req, res) => {
  const { plant } = req.body;

  if (!plant) {
    return res
      .status(400)
      .json({ success: false, error: "Missing plant parameter" });
  }

  // เพิ่ม timeout handling
  const pythonProcess = spawn("python", ["check_farmers.py", plant]);
  
  // Set timeout for the process
  const timeout = setTimeout(() => {
    pythonProcess.kill();
    res.status(504).json({ success: false, error: "Request timeout" });
  }, 30000); // 30 seconds timeout

  let dataToSend = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    dataToSend += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("close", (code) => {
    clearTimeout(timeout); // Clear timeout when process completes

    if (code === 0) {
      try {
        const jsonResponse = JSON.parse(dataToSend);
        if (jsonResponse.error) {
          return res
            .status(500)
            .json({ success: false, error: jsonResponse.error });
        }
        res.json({
          success: true,
          availableFarmers: jsonResponse.availableFarmers,
        });
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

  // Add error handler for process
  pythonProcess.on("error", (err) => {
    clearTimeout(timeout);
    res.status(500).json({ success: false, error: err.message });
  });
});

module.exports = router;
