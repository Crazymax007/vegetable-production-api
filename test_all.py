import pandas as pd
import numpy as np
import json
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# ตรวจสอบว่ามีการส่ง argument สำหรับชนิดของผักหรือไม่
if len(sys.argv) < 2:
    print(json.dumps({"error": "Please provide a Plant name as an argument"}))
    sys.exit(1)

# รับชื่อผักจาก command-line arguments
plant_name = sys.argv[1]

# Load dataset
df = pd.read_csv('Plants.csv', encoding='TIS-620')

# เลือกเฉพาะแถวที่มีค่าคอลัมน์ 'Plant' เท่ากับ plant_name
filtered_data = df.query("Plant == @plant_name")

# ตรวจสอบว่ามีข้อมูลสำหรับผักที่เลือกหรือไม่
if filtered_data.empty:
    print(json.dumps({"error": f"No data found for plant: {plant_name}"}))
    sys.exit(1)

# กำหนด Features และ Target
features = ['Area', 'ProbCode']  # Features
target = 'ID'  # Target

# ลบแถวที่ค่าในคอลัมน์ 'KG' ไม่ใช่ตัวเลข
filtered_data = filtered_data[pd.to_numeric(filtered_data['KG'], errors='coerce').notnull()]
filtered_data['KG'] = filtered_data['KG'].astype(float)

# แยก Features และ Target
X = filtered_data[features]
y = filtered_data[target]

# แบ่งข้อมูลออกเป็น training set และ testing set
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=100)

# สร้าง Random Forest Regressor
rf = RandomForestRegressor(n_estimators=1000, max_depth=10, random_state=50, oob_score=True)
rf.fit(X_train, y_train)

# ทำนายค่า
y_pred = rf.predict(X_test)

# คำนวณ OOB Score, MSE, R2
oob_score = rf.oob_score_ if hasattr(rf, "oob_score_") else None
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# Feature Importance
importances = rf.feature_importances_
feature_names = X.columns
importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})

# ส่งผลลัพธ์เป็น JSON
result = {
    "plant": plant_name,
    "oob_score": oob_score,
    "mse": mse,
    "r2": r2,
    "feature_importance": importance_df.to_dict(orient='records')  # แปลง DataFrame เป็น list ของ dict
}

print(json.dumps(result))
