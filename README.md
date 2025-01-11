# API Endpoints

ข้อมูลเส้น API และข้อมูลที่ต้องส่งไปกับ API

## Authentication

| Endpoint          | Method | Description | Body                   |
| ----------------- | ------ | ----------- | ---------------------- |
| `/api/auth/login` | POST   | Login user  | ```json                |
|                   |        |             | {                      |
|                   |        |             | "username": "tam@tam", |
|                   |        |             | "password": "1234"     |
|                   |        |             | }                      |
|                   |        |             | ```                    |

## Admin Management

| Endpoint            | Method | Description  | Body                         |
| ------------------- | ------ | ------------ | ---------------------------- |
| `/api/admin/farmer` | POST   | Add a farmer | ```json                      |
|                     |        |              | {                            |
|                     |        |              | "firstName": "นายอัมรินทร์", |
|                     |        |              | "lastName": "ดอกยี่สูน",     |
|                     |        |              | "nickname": "แม็ก",          |
|                     |        |              | "phone": "09876543210",      |
|                     |        |              | "location": {                |
|                     |        |              | "latitude": 9.086613,        |
|                     |        |              | "longitude": 99.222596       |
|                     |        |              | }                            |
|                     |        |              | }                            |
|                     |        |              | ```                          |
| `/api/admin/users`  | POST   | Add a user   | ```json                      |
|                     |        |              | {                            |
|                     |        |              | "email": "tam@tam",          |
|                     |        |              | "password": "1234"           |
|                     |        |              | }                            |
|                     |        |              | ```                          |
