import sys
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# รับค่าจาก Node.js
plant = sys.argv[1]  
required_kg = int(sys.argv[2])
num_farmers = int(sys.argv[3])

# โหลดข้อมูล
df = pd.read_csv("Plants_Up.csv", encoding="UTF-8")

# กรองข้อมูลตามชนิดพืช
filtered_data = df.query(f"Plant == '{plant}'")

# เลือก 5 อันดับแรกของแต่ละลูกสวน
top_5_per_farmer = filtered_data.groupby("ID").apply(lambda x: x.nlargest(5, "KG")).reset_index(drop=True)

# กำหนด Features และ Target
features = ["Area", "ProbCode", "Product"]
target = "KG"

# ตรวจสอบคอลัมน์
if not all(feature in top_5_per_farmer.columns for feature in features):
    print(json.dumps({"error": "Missing feature columns"}))
    sys.exit(1)
if target not in top_5_per_farmer.columns:
    print(json.dumps({"error": "Target column 'KG' is missing"}))
    sys.exit(1)

# แยกข้อมูล
X = top_5_per_farmer[features]
y = top_5_per_farmer[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=50)

# สร้างและ Train โมเดล
rf = RandomForestRegressor(n_estimators=500, max_depth=20, min_samples_split=2, min_samples_leaf=2, max_features="log2", random_state=50)
rf.fit(X_train, y_train)

# ทำนายผล
top_5_per_farmer["Predicted_KG"] = np.round(rf.predict(X))

# เลือกจำนวนลูกสวนที่ต้องการ
available_farmers = len(top_5_per_farmer.groupby("ID").size())
if num_farmers > available_farmers:
    print(json.dumps({"error": f"Max available farmers: {available_farmers}"}))
    sys.exit(1)

selected_farmers = top_5_per_farmer.groupby(["ID", "firstname", "lastname"]).agg(
    Max_Actual_KG=("KG", "max"),
    Predicted_KG=("Predicted_KG", "max")
).reset_index()

selected_farmers = selected_farmers.sort_values(by="Predicted_KG", ascending=False).head(num_farmers)

# ปรับผลผลิตให้ตรงกับ required_kg
predicted_sum = selected_farmers["Predicted_KG"].sum()
if predicted_sum > required_kg:
    scale_factor = required_kg / predicted_sum
    selected_farmers["Adjusted_Predicted_KG"] = np.round(selected_farmers["Predicted_KG"] * scale_factor)
else:
    selected_farmers["Adjusted_Predicted_KG"] = selected_farmers["Predicted_KG"]

# ตรวจสอบผลรวม
while selected_farmers["Adjusted_Predicted_KG"].sum() != required_kg:
    diff = required_kg - selected_farmers["Adjusted_Predicted_KG"].sum()
    idx = selected_farmers["Adjusted_Predicted_KG"].idxmax()
    selected_farmers.at[idx, "Adjusted_Predicted_KG"] += diff

# ตรวจสอบไม่ให้ Adjusted_Predicted_KG เกิน Max_Actual_KG
selected_farmers["Adjusted_Predicted_KG"] = selected_farmers[["Adjusted_Predicted_KG", "Max_Actual_KG"]].min(axis=1)


# แปลงผลลัพธ์เป็น JSON และส่งกลับ
result = selected_farmers[["ID", "firstname", "lastname", "Max_Actual_KG", "Adjusted_Predicted_KG"]].to_dict(orient="records")
print(json.dumps(result))
