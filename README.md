# API Endpoints

ข้อมูลเส้นAPI และ ข้อมูลที่ต้องส่งไปกับAPI

## Authentication

| Endpoint          | Method | Description | Body                                            |
| ----------------- | ------ | ----------- | ----------------------------------------------- |
| `/api/auth/login` | POST   | Login user  | `{ "username": "ammarin", "password": "1234" }` |

## Farmers Management

| Endpoint                | Method | Description         | Body                                             |
| ----------------------- | ------ | ------------------- | ------------------------------------------------ |
| `/api/admin/farmer`     | POST   | Add a farmer        | `ข้อมูลของfarmerทั้งหมด มันยาวเกินขี้เกียจเพิ่ม` |
| `/api/admin/farmer`     | GET    | Get farmer          | None                                             |
| `/api/admin/farmer/:id` | GET    | Get farmer by Id    | `{"id":123}`                                     |
| `/api/admin/farmer/:id` | PUT    | Update farmer by Id | `{"id":123,(ต่อด้วยข้อมูลของfarmerทั้งหมด)`      |
| `/api/admin/farmer/:id` | DELETE | Delete farmer by ID | `{"id":123}`                                     |

## Users Management

| Endpoint              | Method | Description       | Body                                             |
| --------------------- | ------ | ----------------- | ------------------------------------------------ |
| `/api/admin/user`     | POST   | Add a user        | `ข้อมูลของfarmerทั้งหมด มันยาวเกินขี้เกียจเพิ่ม` |
| `/api/admin/user`     | GET    | Get user          | None                                             |
| `/api/admin/user/:id` | GET    | Get user by Id    | `{"id":123}`                                     |
| `/api/admin/user/:id` | PUT    | Update user by Id | `{"id":123,(user)`                               |
| `/api/admin/user/:id` | DELETE | Delete user by ID | `{"id":123}`                                     |

## Vegetables Management

| Endpoint              | Method | Description            | Body                                    |
| --------------------- | ------ | ---------------------- | --------------------------------------- |
| `/api/vegetables`     | POST   | Add Vegetable          | `{"name":"คะน้า"}`                      |
| `/api/vegetables`     | GET    | Get Vegetable          | None                                    |
| `/api/vegetables/:id` | GET    | Get Vegetable by Id    | `{"id":123}`                            |
| `/api/vegetables/:id` | PATCH  | Update Vegetable by Id | `{"id":123,(ต่อด้วยข้อมูลของVegetable)` |
| `/api/vegetables/:id` | DELETE | Delete Vegetable by ID | `{"id":123}`                            |

## Orders Management

| Endpoint              | Method | Description         | Body                                              |
| --------------------- | ------ | ------------------- | ------------------------------------------------- |
| `/api/orders`         | POST   | Add orders          | `{"id":123, (และข้อมูลลูกสวน,วันที่, จำนวนกิโล)}` |
| `/api/orders?limit=5` | GET    | Get All orders      | ถ้าอยากกำหนดจำนวนที่จะดูก็ใส่limit                |
| `/api/orders/:id`     | GET    | Get orders by Id    | `{"id":123}`                                      |
| `/api/orders/:id`     | PATCH  | Update orders by Id | `{"id":123,(และข้อมูลลูกสวน,วันที่, จำนวนกิโล)`   |
| `/api/orders/:id`     | DELETE | Delete orders by ID | `{"id":123}`                                      |
