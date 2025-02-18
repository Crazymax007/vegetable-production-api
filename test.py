import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Load dataset
df = pd.read_csv('Plants_Up.csv', encoding='UTF-8')#Plants.csv

# เลือกเฉพาะแถวที่มีค่าคอลัมน์ 'Plant' เท่ากับ 'ผักกาดหอม'
filtered_data = df.query("Plant == 'ผักกาดหอม'")

# เลือกค่ามากที่สุด 5 อันดับของแต่ละลูกสวน
top_5_per_farmer = filtered_data.groupby('ID').apply(lambda x: x.nlargest(5, 'KG')).reset_index(drop=True)

# กำหนด Features และ Target
features = ['Area','ProbCode','Product']  # Features
target = 'KG'  # เปลี่ยน Target เป็น KG เพื่อให้เหมาะสมกับการพยากรณ์

# ตรวจสอบว่าคอลัมน์ที่กำหนดมีอยู่ใน DataFrame
if not all(feature in top_5_per_farmer.columns for feature in features):
    raise ValueError("One or more feature columns are missing in the dataset.")
if target not in top_5_per_farmer.columns:
    raise ValueError("Target column 'KG' is missing in the dataset.")

# แยก Features และ Target
X = top_5_per_farmer[features]
y = top_5_per_farmer[target]

# แบ่งข้อมูลออกเป็น training set และ testing set
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=50)

# สร้าง Random Forest Regressor พร้อมปรับพารามิเตอร์ให้แม่นยำขึ้น
rf = RandomForestRegressor(
    n_estimators=500,       # จำนวนต้นไม้ที่มากขึ้น
    max_depth=20,            # เพิ่มความลึกของต้นไม้ (10-20)
    min_samples_split=2,     # จำนวนข้อมูลขั้นต่ำที่ต้องการเพื่อการแบ่ง (5-10)
    min_samples_leaf=2,      # (2-5)
    max_features='log2',     # ใช้ฟีเจอร์ที่ดีที่สุด    ค่าที่แนะนำ: max_features='sqrt' หรือ max_features='log2'
    random_state=50, 
    oob_score=True,
    bootstrap=True
)
rf.fit(X_train, y_train)

# ทำนายค่า
top_5_per_farmer['Predicted_KG'] = np.round(rf.predict(X))  # ปรับให้เป็นเลขจำนวนเต็ม

# คำนวณ OOB Score, MSE, R2
if hasattr(rf, "oob_score_"):
    print("OOB Score:", rf.oob_score_)
print("Mean Squared Error:", mean_squared_error(y_test, rf.predict(X_test)))
print("R-squared:", r2_score(y_test, rf.predict(X_test)))

# รับค่าจำนวนกิโลกรัมที่ต้องการและจำนวนลูกสวน
required_kg = int(input("Enter required KG: "))

# ตรวจสอบจำนวนลูกสวนที่มีอยู่ในข้อมูล
available_farmers = len(top_5_per_farmer.groupby('ID').size())

# ขอให้ผู้ใช้ระบุจำนวนลูกสวนที่ต้องการ
num_farmers = int(input(f"Enter number of farmers (max {available_farmers}): "))

# เช็คเงื่อนไขว่าจำนวนลูกสวนไม่เกินที่มีในข้อมูล
if num_farmers > available_farmers:
    print(f"Error: You can only select up to {available_farmers} farmers.")
else:
    # เลือกลูกสวนที่มีผลผลิตสูงสุดตามจำนวนที่ระบุ
    selected_farmers = top_5_per_farmer.groupby(['ID', 'firstname', 'lastname']).agg(
        Max_Actual_KG=('KG', 'max'),  # ค่าสูงสุดจริงจากข้อมูล
        Predicted_KG=('Predicted_KG', 'max')  # ค่าที่พยากรณ์ได้
    ).reset_index()

    # เลือกลูกสวนที่มีผลผลิตสูงสุดตามจำนวนที่ระบุ
    selected_farmers = selected_farmers.sort_values(by='Predicted_KG', ascending=False).head(num_farmers)

    # เช็คว่า Predicted_KG ไม่เกิน Max_Actual_KG
    selected_farmers['Predicted_KG'] = selected_farmers.apply(
        lambda row: min(row['Predicted_KG'], row['Max_Actual_KG']), axis=1
    )

    # ปรับผลผลิตของลูกสวนให้พอดีกับ required_kg
    predicted_sum = selected_farmers['Predicted_KG'].sum()
    if predicted_sum > required_kg:
        scale_factor = required_kg / predicted_sum
        selected_farmers['Adjusted_Predicted_KG'] = np.round(selected_farmers['Predicted_KG'] * scale_factor)
    else:
        selected_farmers['Adjusted_Predicted_KG'] = selected_farmers['Predicted_KG']

    # ตรวจสอบว่าผลรวมตรงกับที่ต้องการ
    while selected_farmers['Adjusted_Predicted_KG'].sum() != required_kg:
        diff = required_kg - selected_farmers['Adjusted_Predicted_KG'].sum()
        idx = selected_farmers['Adjusted_Predicted_KG'].idxmax()
        selected_farmers.at[idx, 'Adjusted_Predicted_KG'] += diff

    print("\nSelected Farmers with Adjusted Predicted KG (including max KG constraint):")
    print(selected_farmers[['ID', 'firstname', 'lastname', 'Max_Actual_KG', 'Adjusted_Predicted_KG']].to_string(index=False))

# สร้างกราฟแสดง Feature Importance
importances = rf.feature_importances_
feature_names = X.columns

importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
importance_df = importance_df.sort_values(by='Importance', ascending=False)
print("\nFeature Importance:")
print(importance_df)



