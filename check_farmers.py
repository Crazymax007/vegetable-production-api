import sys
import pandas as pd
import json

# รับค่าจาก Node.js
plant = sys.argv[1]

# ตรวจสอบการโหลดไฟล์ CSV
try:
    df = pd.read_csv("Plants_Up.csv", encoding="UTF-8")
except Exception as e:
    print(json.dumps({"error": f"Failed to load CSV: {str(e)}"}))
    sys.exit(1)

# กรองข้อมูลตามชนิดพืช
filtered_data = df.query(f"Plant == '{plant}'")

# คำนวณจำนวนลูกสวนที่มีอยู่
available_farmers = len(filtered_data.groupby("ID").size())

# ส่งกลับจำนวนลูกสวนที่สามารถเลือกได้
print(json.dumps({"availableFarmers": available_farmers}))
