# TAI LIEU CHUC NANG TAT CA FILE CODE

Tai lieu nay cap nhat theo code hien tai cua workspace khoaluantotnghiep_frontend_sync (Backend + Frontend).

## 1) Tong quan he thong

- Mo hinh fullstack:
  - Backend: Spring Boot 3.5.13, Java 17, PostgreSQL, Redis, JWT, SMTP, OpenAPI, PDF export.
  - Frontend: Next.js 15 (App Router), React 19 RC, TypeScript, Axios, Sonner.
- Nhom vai tro chinh: ADMIN, DOCTOR, RECEPTIONIST, CASHIER, PATIENT.
- Luong nghiep vu chinh: dang nhap -> dat lich -> le tan duyet -> bac si kham/tao benh an/ke don -> thu ngan thanh toan -> benh nhan theo doi lich su va hoa don.
- Chatbot AI Gemini duoc tich hop cho landing page va khu vuc benh nhan.

## 2) Backend - Build va cau hinh

| File                                                                      | Chuc nang                                                                                      |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| pom.xml                                                                   | Khai bao dependency Spring Boot, JPA, Security, Validation, Mail, Redis, JWT, PDFBox, OpenAPI. |
| mvnw / mvnw.cmd                                                           | Maven Wrapper.                                                                                 |
| src/main/resources/application.properties                                 | Cau hinh DB, Redis, JWT, CORS, SMTP, Gemini, logging, server port.                             |
| src/main/resources/META-INF/additional-spring-configuration-metadata.json | Metadata cho custom properties de IDE goi y.                                                   |

## 3) Backend - Khoi dong va cau hinh he thong

<<<<<<< HEAD
| File                                                                      | Chuc nang                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| src/main/java/com/example/demo/config/OpenApiConfig.java                  | Cau hinh Swagger/OpenAPI va bearerAuth.                             |
| src/main/java/com/example/demo/config/GeminiConfig.java                   | Khai bao bean RestTemplate/ObjectMapper cho module chatbot Gemini.  |
| src/main/java/com/example/demo/config/GeminiProperties.java               | Mapping cac bien cau hinh chatbot Gemini tu application.properties. |
| src/main/java/com/example/demo/config/SecurityConfig.java                 | Phan quyen endpoint theo role, session stateless, JWT filter.       |
| src/main/java/com/example/demo/config/CustomAuthenticationEntryPoint.java | Chuan hoa phan hoi 401 khi chua/xai sai JWT.                        |
| src/main/java/com/example/demo/config/CustomAccessDeniedHandler.java      | Chuan hoa phan hoi 403 khi khong du quyen role.                     |
| src/main/java/com/example/demo/security/JwtFilter.java                    | Trich token Bearer, nap SecurityContext cho request.                |
=======
| File                                                                      | Chuc nang                                                                    |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| src/main/java/com/example/demo/DemoApplication.java                       | Entry point khoi dong Spring Boot.                                           |
| src/main/java/com/example/demo/config/OpenApiConfig.java                  | Cau hinh Swagger/OpenAPI va security scheme bearerAuth.                      |
| src/main/java/com/example/demo/config/GeminiConfig.java                   | Tao bean cho giao tiep Gemini.                                               |
| src/main/java/com/example/demo/config/GeminiProperties.java               | Mapping config Gemini tu application.properties.                             |
| src/main/java/com/example/demo/config/SecurityConfig.java                 | Cau hinh phan quyen endpoint theo role, stateless session, JWT filter chain. |
| src/main/java/com/example/demo/config/CustomAuthenticationEntryPoint.java | Chuan hoa loi 401 (unauthorized).                                            |
| src/main/java/com/example/demo/config/CustomAccessDeniedHandler.java      | Chuan hoa loi 403 (forbidden).                                               |
| src/main/java/com/example/demo/security/JwtFilter.java                    | Doc Bearer token va nap SecurityContext cho request.                         |
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

## 4) Backend - Controller (API layer)

<<<<<<< HEAD
| File                                                                   | Chuc nang                                                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| src/main/java/com/example/demo/controller/AuthController.java          | Dang nhap, dang ky benh nhan, quy trinh quen mat khau OTP (send/verify/reset).         |
| src/main/java/com/example/demo/controller/AdminController.java         | Dashboard, bao cao doanh thu, quan ly users, rooms, medicines, services.               |
| src/main/java/com/example/demo/controller/AppointmentController.java   | Quan ly lich hen tong quat (list, waiting-assignment, tao lich, assign doctor).        |
| src/main/java/com/example/demo/controller/ReceptionistController.java  | Nghiep vu le tan: duyet/tu choi lich, waiting queue, tim doctor theo specialty.        |
| src/main/java/com/example/demo/controller/DoctorController.java        | Nghiep vu bac si: waiting patients, cap nhat phong, xem lich su benh an benh nhan.     |
| src/main/java/com/example/demo/controller/MedicalRecordController.java | Benh an va don thuoc: tao, cap nhat, workspace, quick-add, complete, service results.  |
| src/main/java/com/example/demo/controller/CashierController.java       | Nghiep vu thu ngan: queue thanh toan, xu ly thanh toan, bien lai, export PDF, history. |
| src/main/java/com/example/demo/controller/PatientController.java       | Benh nhan: profile, dat/huy lich, xem lich hen va lich su benh an.                     |
| src/main/java/com/example/demo/controller/ChatbotController.java       | API hoi dap AI: ask, lay lich su va xoa lich su chatbot theo user dang nhap.           |
=======
### 4.1 AuthController
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

File: src/main/java/com/example/demo/controller/AuthController.java

<<<<<<< HEAD
| File                                                             | Chuc nang                                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| src/main/java/com/example/demo/service/AuthService.java          | Login/register, quen mat khau OTP tren Redis, rate-limit OTP, reset password.      |
| src/main/java/com/example/demo/service/RefreshTokenService.java  | Tao, luu, quay vong va thu hoi refresh token trong Redis.                          |
| src/main/java/com/example/demo/service/JwtService.java           | Tao va parse JWT.                                                                  |
| src/main/java/com/example/demo/service/NotificationService.java  | Gui email OTP, thong bao dat lich moi, thong bao duyet/tu choi lich cho benh nhan. |
| src/main/java/com/example/demo/service/AdminService.java         | Nghiep vu admin va bao cao doanh thu.                                              |
| src/main/java/com/example/demo/service/AppointmentService.java   | Tao lich kham, assign doctor, quan ly lich benh nhan.                              |
| src/main/java/com/example/demo/service/ReceptionistService.java  | Xu ly waiting queue, approve/cancel appointment, dieu phoi doctor.                 |
| src/main/java/com/example/demo/service/DoctorService.java        | Danh sach doctor, waiting patients, clinic room.                                   |
| src/main/java/com/example/demo/service/MedicalRecordService.java | Nghiep vu benh an, don thuoc, service results, prescription workspace.             |
| src/main/java/com/example/demo/service/InvoiceService.java       | Tong hop vien phi, xu ly thanh toan, in/xuat hoa don, lich su giao dich.           |
| src/main/java/com/example/demo/service/PatientService.java       | Truy xuat thong tin benh nhan va lich su benh an cho role PATIENT.                 |
| src/main/java/com/example/demo/service/GeminiChatbotService.java | Xu ly prompt chatbot, goi Gemini API va luu/lay lich su hoi thoai.                 |
=======
- Base path: /api/auth
- Endpoint:
  - POST /login
  - POST /register/patient
  - POST /refresh
  - POST /logout
  - POST /forgot-password/send-otp
  - POST /forgot-password/verify-otp
  - POST /forgot-password/reset
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

### 4.2 AdminController

<<<<<<< HEAD
| File                                                                                | Chuc nang                                                  |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| src/main/java/com/example/demo/repository/AppointmentRepository.java                | Truy van lich hen theo doctor, status, thoi gian.          |
| src/main/java/com/example/demo/repository/InvoiceRepository.java                    | Truy van hoa don va giao dich thanh toan.                  |
| src/main/java/com/example/demo/repository/MedicalRecordRepository.java              | Truy van benh an.                                          |
| src/main/java/com/example/demo/repository/MedicalRecordServiceDetailRepository.java | Truy van ket qua dich vu can lam sang theo benh an.        |
| src/main/java/com/example/demo/repository/MedicalServiceRepository.java             | Truy van danh muc dich vu y te.                            |
| src/main/java/com/example/demo/repository/MedicineRepository.java                   | Truy van danh muc thuoc.                                   |
| src/main/java/com/example/demo/repository/PatientRepository.java                    | Truy van benh nhan (co tim theo gmail).                    |
| src/main/java/com/example/demo/repository/PrescriptionDetailRepository.java         | Truy van chi tiet don thuoc.                               |
| src/main/java/com/example/demo/repository/RoomRepository.java                       | Truy van phong kham va doctor hien tai theo phong.         |
| src/main/java/com/example/demo/repository/UserRepository.java                       | Truy van tai khoan theo username/role/trang thai.          |
| src/main/java/com/example/demo/repository/ChatbotMessageRepository.java             | Truy van lich su hoi thoai chatbot theo user/patient/time. |
=======
File: src/main/java/com/example/demo/controller/AdminController.java
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

- Base path: /api/admin
- Nhom endpoint:
  - Dashboard: GET /dashboard
  - Revenue report: GET /revenue-report, GET /revenue-report/export
  - Users: GET/POST /users, PUT/DELETE /users/{userId}
  - Rooms: GET/POST /rooms, PUT /rooms/{roomId}, PUT /rooms/{roomId}/assign-doctor
  - Medicines: GET/POST /medicines, PUT /medicines/{medicineId}, DELETE /medicines/{medicineId}
  - Services: GET/POST /services, PUT /services/{serviceId}/price, DELETE /services/{serviceId}
  - System settings: GET /settings, GET /settings/{settingKey}, PUT /settings/{settingKey}

### 4.3 AppointmentController

<<<<<<< HEAD
- src/main/java/com/example/demo/entity/ChatbotMessage.java: bang luu hoi thoai chatbot (role message, noi dung, thoi diem, user/patient).
- src/main/java/com/example/demo/entity/Appointment.java:lịch hẹn khám giữa bệnh nhân và bác sĩ.
- src/main/java/com/example/demo/entity/Invoice.java:hóa đơn thanh toán cho bệnh án.
- src/main/java/com/example/demo/entity/MedicalRecord.java:bệnh án sau khi bác sĩ khám.
- src/main/java/com/example/demo/entity/MedicalRecordServiceDetail.java:chi tiết dịch vụ phát sinh trong một bệnh án
- src/main/java/com/example/demo/entity/MedicalRecordServiceId.java:khóa ghép cho bảng chi tiết dịch vụ bệnh án
- src/main/java/com/example/demo/entity/MedicalService.java: danh mục dịch vụ y tế.
- src/main/java/com/example/demo/entity/Medicine.java:danh mục thuốc và tồn kho.
- src/main/java/com/example/demo/entity/Patient.java:hồ sơ bệnh nhân, gắn với tài khoản user.
- src/main/java/com/example/demo/entity/PrescriptionDetail.java:từng dòng thuốc trong đơn thuốc của bệnh án.
- src/main/java/com/example/demo/entity/PrescriptionDetailId.java:khóa ghép cho chi tiết đơn thuốc.
- src/main/java/com/example/demo/entity/Role.java: enum vai trò người dùng như ADMIN, DOCTOR, PATIENT...
- src/main/java/com/example/demo/entity/Room.java:thông tin phòng khám và bác sĩ đang phụ trách phòng.
- src/main/java/com/example/demo/entity/User.java: thực thể người dùng hệ thống, chứa thông tin tài khoản và quyền.
=======
File: src/main/java/com/example/demo/controller/AppointmentController.java
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

- Base path: /api/appointments
- Endpoint:
  - GET /
  - GET /waiting-assignment
  - POST /
  - PUT /{appointmentId}/assign-doctor

<<<<<<< HEAD
### 8.1 Nhom Auth

- LoginRequest.java: request body cho dang nhap (username/password).
- AuthResponse.java: response sau login/register/refresh (access token, refresh token, role, username).
- RefreshTokenRequest.java: request body refresh va logout bang refresh token.
- PatientRegisterRequest.java: request dang ky tai khoan benh nhan.
- ForgotPasswordRequest.java: request gui OTP quen mat khau theo email.
- VerifyForgotPasswordOtpRequest.java: request xac thuc OTP.
- ResetPasswordWithOtpRequest.java: request dat lai mat khau sau khi OTP hop le.

### 8.2 Nhom Dashboard va thong ke Admin

- DashboardResponse.java: bo so lieu tong quan cho trang admin dashboard.
- AdminRevenueReportResponse.java: response bao cao doanh thu tong hop.
- AdminRevenueReportItemResponse.java: tung dong thong ke trong bao cao doanh thu.
- AdminRevenueChartPointResponse.java: diem du lieu dung ve bieu do doanh thu.
- TopDoctorDTO.java: thong tin bac si noi bat theo tieu chi thong ke.

### 8.3 Nhom quan ly nguoi dung (Admin)

- AdminCreateUserRequest.java: request tao tai khoan moi.
- AdminUpdateUserRequest.java: request cap nhat thong tin/trang thai user.
- AdminUserResponse.java: response hien thi user cho man hinh admin.

### 8.4 Nhom phong kham (Admin)

- AdminRoomCreateRequest.java: request tao phong kham.
- AdminRoomUpdateRequest.java: request doi ten/thong tin phong.
- AdminRoomAssignDoctorRequest.java: request gan bac si vao phong.
- AdminRoomResponse.java: response phong kham cho man hinh admin.

### 8.5 Nhom thuoc va dich vu (Admin)

- AdminMedicineCreateRequest.java: request them thuoc moi.
- AdminMedicineUpdateRequest.java: request cap nhat thuoc.
- AdminMedicineResponse.java: response danh sach/chi tiet thuoc.
- AdminMedicalServiceCreateRequest.java: request them dich vu y te.
- AdminMedicalServiceUpdatePriceRequest.java: request cap nhat gia dich vu.
- AdminMedicalServiceResponse.java: response danh sach/chi tiet dich vu.

### 8.6 Nhom lich hen tong quat

- AppointmentRequest.java: request tao lich hen (luong chung).
- AppointmentAssignDoctorRequest.java: request gan bac si cho lich hen.

### 8.7 Nhom benh nhan (Patient API)

- PatientAppointmentRequest.java: request dat lich cua benh nhan.
- PatientPrefillResponse.java: response du lieu dien san ho so benh nhan.
- PatientMedicalRecordHistoryItemResponse.java: tung dong lich su benh an cho benh nhan.
- PatientMedicalRecordDetailResponse.java: chi tiet benh an cua benh nhan.
- PatientPrescriptionHistoryItemResponse.java: tung dong don thuoc trong chi tiet benh an.

### 8.8 Nhom le tan (Receptionist API)

- ReceptionistApproveRequest.java: request duyet lich (doctorId/specialty).
- ReceptionistCancelAppointmentRequest.java: request huy lich hen boi le tan.
- ReceptionistWaitingStatusUpdateRequest.java: request doi trang thai trong hang cho.
- ReceptionistDoctorOptionResponse.java: response danh sach lua chon bac si cho le tan.

### 8.9 Nhom bac si (Doctor API)

- DoctorResponse.java: response thong tin bac si.
- DoctorClinicRoomRequest.java: request cap nhat phong kham cua bac si.
- DoctorPatientHistoryResponse.java: response tong quan lich su benh nhan.
- DoctorPatientHistoryRowResponse.java: tung dong tom tat lich su kham.
- DoctorPatientHistoryDetailResponse.java: chi tiet mot benh an cu.
- DoctorPatientPrescriptionItemResponse.java: thong tin thuoc trong lich su benh nhan.
- DoctorPatientServiceItemResponse.java: thong tin dich vu trong lich su benh nhan.

### 8.10 Nhom benh an, ke don va workspace

- CreateMedicalRecordRequest.java: request tao benh an boi bac si.
- AddPrescriptionDetailRequest.java: request them thuoc vao don.
- UpdatePrescriptionDetailRequest.java: request sua so luong/huong dan dung thuoc.
- QuickAddPrescriptionMedicineRequest.java: request them nhanh thuoc tu catalog.
- UpsertMedicalRecordServiceResultRequest.java: request them/sua ket qua dich vu trong benh an.
- PrescriptionWorkspaceResponse.java: response tong hop workspace ke don.
- PrescriptionMedicineCatalogResponse.java: response danh muc thuoc co the ke.
- PrescriptionCatalogMedicineResponse.java: item thuoc trong catalog workspace.
- PrescriptionLineResponse.java: item thuoc da ke trong workspace.
- PrescriptionAutosaveResponse.java: response autosave khi doctor dang nhap lieu.

### 8.11 Nhom thu ngan, hoa don va bien lai

- CashierWaitingPaymentItemResponse.java: item trong hang doi cho thanh toan.
- CashierPaymentRecordDetailResponse.java: chi tiet mot ho so thanh toan.
- CashierServiceLineItemResponse.java: item dich vu trong hoa don.
- CashierMedicineLineItemResponse.java: item thuoc trong hoa don.
- CashierProcessPaymentRequest.java: request xu ly thanh toan.
- CashierProcessPaymentResponse.java: response ket qua xu ly thanh toan.
- CashierReceiptResponse.java: response hien thi bien lai.
- CashierPrintReceiptResponse.java: response ket qua in bien lai.
- CashierTransactionHistoryResponse.java: response tong lich su giao dich.
- CashierTransactionHistoryItemResponse.java: item giao dich trong lich su.

### 8.12 Nhom chatbot AI

- ChatbotAskRequest.java: request cau hoi gui chatbot.
- ChatbotAskResponse.java: response cau tra loi chatbot.
- ChatbotHistoryItemResponse.java: item lich su hoi thoai chatbot.
=======
### 4.4 ReceptionistController

File: src/main/java/com/example/demo/controller/ReceptionistController.java

- Base path: /api/receptionist
- Endpoint:
  - GET /appointments/today
  - GET /appointments/from-booking
  - GET /doctors/by-specialty
  - PUT /appointments/{appointmentId}/approve
  - PUT /appointments/{appointmentId}/assign-doctor
  - GET /appointments/waiting
  - PUT /appointments/{appointmentId}/waiting-status
  - PUT /appointments/{appointmentId}/cancel

### 4.5 DoctorController

File: src/main/java/com/example/demo/controller/DoctorController.java

- Base path: /api/doctors
- Endpoint:
  - GET /
  - GET /me/waiting-patients
  - GET /me/completed-patients
  - PUT /{doctorId}/clinic-room
  - GET /appointments/{appointmentId}/patient-history
  - GET /appointments/{appointmentId}/patient-history/{medicalRecordId}

### 4.6 MedicalRecordController

File: src/main/java/com/example/demo/controller/MedicalRecordController.java

- Base path: /api/medical-records
- Endpoint:
  - GET /
  - GET /{id}
  - GET /appointment/{appointmentId}
  - POST /
  - POST /doctor
  - POST /{medicalRecordId}/prescription-details
  - GET /{medicalRecordId}/prescription-details
  - POST /{medicalRecordId}/service-results
  - GET /{medicalRecordId}/prescription-workspace
  - GET /{medicalRecordId}/medicine-catalog
  - POST /{medicalRecordId}/prescription-details/quick-add
  - PUT /{medicalRecordId}/prescription-details/{medicineId}
  - PUT /{medicalRecordId}/prescription-details/{medicineId}/autosave
  - DELETE /{medicalRecordId}/prescription-details/{medicineId}
  - POST /{medicalRecordId}/prescription-save
  - PUT /{medicalRecordId}/complete
  - PUT /{id}
  - DELETE /{id}

### 4.7 CashierController

File: src/main/java/com/example/demo/controller/CashierController.java

- Base path: /api/cashier
- Endpoint:
  - GET /payment-queue
  - GET /payment-records/search
  - GET /invoices/{invoiceId}/paid-detail
  - GET /transaction-history
  - GET /invoices/by-medical-record
  - POST /invoices/aggregate
  - PUT /invoices/{invoiceId}/confirm-payment
  - POST /invoices/{invoiceId}/process-payment
  - GET /invoices/{invoiceId}/receipt
  - POST /invoices/{invoiceId}/print-receipt
  - GET /invoices/{invoiceId}/export-pdf

### 4.8 PatientController

File: src/main/java/com/example/demo/controller/PatientController.java

- Base path: /api/patient
- Endpoint:
  - GET /profile
  - POST /appointments
  - GET /appointments
  - GET /medical-records
  - GET /medical-records/{medicalRecordId}
  - PUT /appointments/{appointmentId}/cancel

### 4.9 ChatbotController

File: src/main/java/com/example/demo/controller/ChatbotController.java

- Base path: /api/chatbot
- Endpoint:
  - POST /ask
  - GET /history
  - DELETE /history

## 5) Backend - Service (business layer)

| File                                                             | Chuc nang                                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| src/main/java/com/example/demo/service/AuthService.java          | Dang nhap, dang ky patient, forgot-password OTP flow, refresh/logout.   |
| src/main/java/com/example/demo/service/RefreshTokenService.java  | Quan ly refresh token tren Redis.                                       |
| src/main/java/com/example/demo/service/JwtService.java           | Tao/xac thuc JWT.                                                       |
| src/main/java/com/example/demo/service/NotificationService.java  | Gui email OTP va thong bao dat lich.                                    |
| src/main/java/com/example/demo/service/AdminService.java         | Dashboard, report doanh thu, CRUD user/room/medicine/service.           |
| src/main/java/com/example/demo/service/SystemSettingService.java | CRUD key-value settings, uu tien DB va fallback application.properties. |
| src/main/java/com/example/demo/service/AppointmentService.java   | Tao/phan cong/huy lich va quan ly lich hen benh nhan.                   |
| src/main/java/com/example/demo/service/ReceptionistService.java  | Xu ly danh sach cho duyet, hang doi, huy lich boi le tan.               |
| src/main/java/com/example/demo/service/DoctorService.java        | Danh sach bac si, waiting/completed patients, cap nhat phong kham.      |
| src/main/java/com/example/demo/service/MedicalRecordService.java | Tao benh an, ke don, autosave, ket qua can lam sang, complete record.   |
| src/main/java/com/example/demo/service/InvoiceService.java       | Queue thanh toan, xu ly thanh toan, bien lai, PDF, transaction history. |
| src/main/java/com/example/demo/service/PatientService.java       | Lich su benh an benh nhan va chi tiet toa thuoc.                        |
| src/main/java/com/example/demo/service/GeminiChatbotService.java | Goi Gemini API, xu ly hoi dap va lich su chatbot.                       |

## 6) Backend - Repository (data access)

| File                                                                                | Chuc nang                                            |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| src/main/java/com/example/demo/repository/UserRepository.java                       | Truy van user theo username/role/trang thai.         |
| src/main/java/com/example/demo/repository/PatientRepository.java                    | Truy van benh nhan va thong tin lien quan.           |
| src/main/java/com/example/demo/repository/AppointmentRepository.java                | Truy van lich hen theo doctor/status/time.           |
| src/main/java/com/example/demo/repository/MedicalRecordRepository.java              | Truy van benh an.                                    |
| src/main/java/com/example/demo/repository/PrescriptionDetailRepository.java         | Truy van chi tiet don thuoc.                         |
| src/main/java/com/example/demo/repository/MedicalRecordServiceDetailRepository.java | Truy van ket qua dich vu can lam sang trong benh an. |
| src/main/java/com/example/demo/repository/MedicineRepository.java                   | Truy van danh muc thuoc.                             |
| src/main/java/com/example/demo/repository/MedicalServiceRepository.java             | Truy van danh muc dich vu y te.                      |
| src/main/java/com/example/demo/repository/RoomRepository.java                       | Truy van phong kham va phan cong bac si.             |
| src/main/java/com/example/demo/repository/InvoiceRepository.java                    | Truy van hoa don va giao dich thanh toan.            |
| src/main/java/com/example/demo/repository/ChatbotMessageRepository.java             | Truy van lich su hoi thoai chatbot.                  |
| src/main/java/com/example/demo/repository/SystemSettingRepository.java              | Truy van bang system_settings theo key.              |

## 7) Backend - Entity (domain model)

| File                                                                  | Chuc nang                                 |
| --------------------------------------------------------------------- | ----------------------------------------- |
| src/main/java/com/example/demo/entity/User.java                       | Tai khoan nguoi dung va role.             |
| src/main/java/com/example/demo/entity/Patient.java                    | Ho so benh nhan (gan voi user).           |
| src/main/java/com/example/demo/entity/Role.java                       | Enum role he thong.                       |
| src/main/java/com/example/demo/entity/Appointment.java                | Lich hen kham giua patient va doctor.     |
| src/main/java/com/example/demo/entity/MedicalRecord.java              | Benh an sau khi kham.                     |
| src/main/java/com/example/demo/entity/PrescriptionDetail.java         | Tung dong thuoc trong toa.                |
| src/main/java/com/example/demo/entity/PrescriptionDetailId.java       | Khoa ghep cho PrescriptionDetail.         |
| src/main/java/com/example/demo/entity/MedicalService.java             | Danh muc dich vu y te.                    |
| src/main/java/com/example/demo/entity/MedicalRecordServiceDetail.java | Ket qua/chi phi dich vu trong benh an.    |
| src/main/java/com/example/demo/entity/MedicalRecordServiceId.java     | Khoa ghep cho MedicalRecordServiceDetail. |
| src/main/java/com/example/demo/entity/Medicine.java                   | Danh muc thuoc va ton kho.                |
| src/main/java/com/example/demo/entity/Invoice.java                    | Hoa don thanh toan.                       |
| src/main/java/com/example/demo/entity/Room.java                       | Phong kham va doctor phu trach.           |
| src/main/java/com/example/demo/entity/ChatbotMessage.java             | Lich su hoi thoai chatbot.                |
| src/main/java/com/example/demo/entity/SystemSetting.java              | Bang key-value cau hinh dong cho admin.   |

## 8) Backend - DTO (request/response)

### 8.1 Nhom Auth

- LoginRequest.java
- AuthResponse.java
- RefreshTokenRequest.java
- PatientRegisterRequest.java
- ForgotPasswordRequest.java
- VerifyForgotPasswordOtpRequest.java
- ResetPasswordWithOtpRequest.java

### 8.2 Nhom Admin dashboard va bao cao

- DashboardResponse.java
- AdminRevenueReportResponse.java
- AdminRevenueReportItemResponse.java
- AdminRevenueChartPointResponse.java
- TopDoctorDTO.java

### 8.3 Nhom Admin users

- AdminCreateUserRequest.java
- AdminUpdateUserRequest.java
- AdminUserResponse.java

### 8.4 Nhom Admin rooms

- AdminRoomCreateRequest.java
- AdminRoomUpdateRequest.java
- AdminRoomAssignDoctorRequest.java
- AdminRoomResponse.java

### 8.5 Nhom Admin medicines va services

- AdminMedicineCreateRequest.java
- AdminMedicineUpdateRequest.java
- AdminMedicineResponse.java
- AdminMedicalServiceCreateRequest.java
- AdminMedicalServiceUpdatePriceRequest.java
- AdminMedicalServiceResponse.java

### 8.6 Nhom Admin system settings

- AdminSystemSettingResponse.java
- AdminUpdateSystemSettingRequest.java

### 8.7 Nhom Appointment chung

- AppointmentRequest.java
- AppointmentAssignDoctorRequest.java

### 8.8 Nhom Patient API

- PatientAppointmentRequest.java
- PatientPrefillResponse.java
- PatientMedicalRecordHistoryItemResponse.java
- PatientMedicalRecordDetailResponse.java
- PatientPrescriptionHistoryItemResponse.java

### 8.9 Nhom Receptionist API

- ReceptionistApproveRequest.java
- ReceptionistCancelAppointmentRequest.java
- ReceptionistWaitingStatusUpdateRequest.java
- ReceptionistDoctorOptionResponse.java

### 8.10 Nhom Doctor API

- DoctorResponse.java
- DoctorClinicRoomRequest.java
- DoctorPatientHistoryResponse.java
- DoctorPatientHistoryRowResponse.java
- DoctorPatientHistoryDetailResponse.java
- DoctorPatientPrescriptionItemResponse.java
- DoctorPatientServiceItemResponse.java

### 8.11 Nhom Medical record va prescription workspace

- CreateMedicalRecordRequest.java
- AddPrescriptionDetailRequest.java
- UpdatePrescriptionDetailRequest.java
- QuickAddPrescriptionMedicineRequest.java
- UpsertMedicalRecordServiceResultRequest.java
- PrescriptionWorkspaceResponse.java
- PrescriptionMedicineCatalogResponse.java
- PrescriptionCatalogMedicineResponse.java
- PrescriptionLineResponse.java
- PrescriptionAutosaveResponse.java

### 8.12 Nhom Cashier

- CashierWaitingPaymentItemResponse.java
- CashierPaymentRecordDetailResponse.java
- CashierServiceLineItemResponse.java
- CashierMedicineLineItemResponse.java
- CashierProcessPaymentRequest.java
- CashierProcessPaymentResponse.java
- CashierReceiptResponse.java
- CashierPrintReceiptResponse.java
- CashierTransactionHistoryResponse.java
- CashierTransactionHistoryItemResponse.java
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

### 8.13 Nhom Chatbot

- ChatbotAskRequest.java
- ChatbotAskResponse.java
- ChatbotHistoryItemResponse.java

## 9) Backend - Exception va test

| File                                                                 | Chuc nang                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| src/main/java/com/example/demo/exception/AppException.java           | Runtime exception tu dinh nghia cho nghiep vu he thong. |
| src/main/java/com/example/demo/exception/GlobalExceptionHandler.java | Chuan hoa response loi cho API.                         |
| src/test/java/com/example/demo/DemoApplicationTests.java             | Smoke test khoi dong context Spring Boot.               |

## 10) Backend - Script van hanh va migration

<<<<<<< HEAD
| File                                                                                 | Chuc nang                                               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| scripts/start-redis.ps1, scripts/start-redis.cmd                                     | Khoi dong Redis local cho OTP flow.                     |
| scripts/stop-redis.ps1, scripts/stop-redis.cmd                                       | Dung Redis local va xoa marker pid.                     |
| scripts/migrate-sqlserver-to-postgres.ps1, scripts/migrate-sqlserver-to-postgres.cmd | Ho tro migrate du lieu SQL Server sang PostgreSQL.      |
| scripts/MIGRATE_SQLSERVER_TO_POSTGRES.md                                             | Huong dan chi tiet migration pipeline.                  |
| scripts/check-bom.ps1, scripts/remove-bom.ps1                                        | Kiem tra/xu ly BOM trong source file.                   |
| scripts/add-chatbot-history-postgres.sql                                             | Tao bang luu lich su hoi thoai chatbot tren PostgreSQL. |
=======
| File                                                                                  | Chuc nang                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| scripts/start-redis.ps1 / scripts/start-redis.cmd                                     | Khoi dong Redis local cho OTP va refresh token.         |
| scripts/stop-redis.ps1 / scripts/stop-redis.cmd                                       | Dung Redis va don dep pid marker.                       |
| scripts/add-chatbot-history-postgres.sql                                              | Tao bang chatbot_messages + index.                      |
| scripts/add-system-settings-postgres.sql                                              | Tao bang system_settings va seed key cau hinh mac dinh. |
| scripts/migrate-sqlserver-to-postgres.ps1 / scripts/migrate-sqlserver-to-postgres.cmd | Ho tro migration du lieu SQL Server -> PostgreSQL.      |
| scripts/MIGRATE_SQLSERVER_TO_POSTGRES.md                                              | Huong dan migration.                                    |
| scripts/check-bom.ps1 / scripts/remove-bom.ps1                                        | Kiem tra va loai BOM trong source file.                 |
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

## 11) Frontend - Build va cau hinh

| File                         | Chuc nang                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Frontend/package.json        | Scripts dev/build/start/lint va dependency Next.js + React + Axios + Sonner. |
| Frontend/next.config.ts      | Cau hinh Next.js.                                                            |
| Frontend/tsconfig.json       | Cau hinh TypeScript.                                                         |
| Frontend/next-env.d.ts       | Type declaration mac dinh cua Next.js.                                       |
| Frontend/src/app/globals.css | CSS global app.                                                              |
| Frontend/src/app/layout.tsx  | Root layout, toaster va FloatingChatbot (scope landing + patients).          |

## 12) Frontend - App Router (src/app)

<<<<<<< HEAD
- He thong hien tai dang van hanh tren PostgreSQL + Redis.
- Khi them/sua/xoa file nguon, can cap nhat lai tai lieu nay de dong bo.
=======
### 12.1 Public/Auth routes

| Route           | File                                            | Chuc nang                           |
| --------------- | ----------------------------------------------- | ----------------------------------- |
| /               | Frontend/src/app/page.tsx                       | Trang landing page.                 |
| /signin         | Frontend/src/app/(auth)/signin/page.tsx         | Man hinh dang nhap theo role.       |
| /signup         | Frontend/src/app/(auth)/signup/page.tsx         | Dang ky tai khoan benh nhan.        |
| /forgotpassword | Frontend/src/app/(auth)/forgotpassword/page.tsx | Quy trinh quen mat khau OTP 4 buoc. |

### 12.2 Patient routes (route group (patients))

| Route            | File                                                 | Chuc nang                                |
| ---------------- | ---------------------------------------------------- | ---------------------------------------- |
| /dashboard       | Frontend/src/app/(patients)/dashboard/page.tsx       | Tong quan benh nhan.                     |
| /appointments    | Frontend/src/app/(patients)/appointments/page.tsx    | Danh sach lich hen, filter, huy lich.    |
| /booking         | Frontend/src/app/(patients)/booking/page.tsx         | Dat lich kham.                           |
| /patient-history | Frontend/src/app/(patients)/patient-history/page.tsx | Lich su benh an va toa thuoc.            |
| /invoices        | Frontend/src/app/(patients)/invoices/page.tsx        | Lich su hoa don da thanh toan.           |
| (layout)         | Frontend/src/app/(patients)/layout.tsx               | Sidebar benh nhan va profile short info. |

### 12.3 Admin routes

| Route            | File                                      | Chuc nang                           |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| /admin           | Frontend/src/app/admin/page.tsx           | Dashboard tong quan admin.          |
| /admin/users     | Frontend/src/app/admin/users/page.tsx     | Quan ly user.                       |
| /admin/rooms     | Frontend/src/app/admin/rooms/page.tsx     | Quan ly phong kham + gan bac si.    |
| /admin/medicines | Frontend/src/app/admin/medicines/page.tsx | Quan ly danh muc thuoc.             |
| /admin/services  | Frontend/src/app/admin/services/page.tsx  | Quan ly danh muc dich vu.           |
| /admin/reports   | Frontend/src/app/admin/reports/page.tsx   | Bao cao va thong ke.                |
| /admin/settings  | Frontend/src/app/admin/settings/page.tsx  | Quan ly setting key-value.          |
| (layout)         | Frontend/src/app/admin/layout.tsx         | Sidebar admin va dieu huong module. |

### 12.4 Receptionist routes

| Route                   | File                                             | Chuc nang                   |
| ----------------------- | ------------------------------------------------ | --------------------------- |
| /receptionist           | Frontend/src/app/receptionist/page.tsx           | Dashboard le tan tong hop.  |
| /receptionist/pending   | Frontend/src/app/receptionist/pending/page.tsx   | Loc danh sach cho xac nhan. |
| /receptionist/confirmed | Frontend/src/app/receptionist/confirmed/page.tsx | Loc danh sach da xac nhan.  |
| (layout)                | Frontend/src/app/receptionist/layout.tsx         | Sidebar le tan.             |

### 12.5 Doctor routes

| Route    | File                               | Chuc nang                                               |
| -------- | ---------------------------------- | ------------------------------------------------------- |
| /doctor  | Frontend/src/app/doctor/page.tsx   | Queue kham, tao benh an, ke don, xem lich su benh nhan. |
| (layout) | Frontend/src/app/doctor/layout.tsx | Sidebar bac si.                                         |

### 12.6 Cashier routes

| Route            | File                                      | Chuc nang                           |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| /cashier         | Frontend/src/app/cashier/page.tsx         | Man hinh thu ngan xu ly thanh toan. |
| /cashier/history | Frontend/src/app/cashier/history/page.tsx | Lich su giao dich va export PDF.    |
| (layout)         | Frontend/src/app/cashier/layout.tsx       | Sidebar thu ngan.                   |

## 13) Frontend - Feature modules (src/features)

### 13.1 Auth

- Frontend/src/features/auth/sign-in/sign-in-form.tsx: form login, map role -> route dich.
- Frontend/src/features/auth/sign-up/sign-up-form.tsx: form dang ky benh nhan, validate input.
- Frontend/src/features/auth/forgotpassword/forgotpassword.tsx: send OTP, verify OTP, reset password.

### 13.2 Landing

- Frontend/src/features/landingpage/landingpage.tsx: trang gioi thieu phong kham, CTA dang nhap/dang ky.

### 13.3 Admin

- Frontend/src/features/admin/components/reports.tsx: dashboard KPI.
- Frontend/src/features/admin/components/user-management.tsx: CRUD user + toggle active.
- Frontend/src/features/admin/components/rooms-management.tsx: CRUD room + assign doctor.
- Frontend/src/features/admin/components/medicines-management.tsx: CRUD medicine.
- Frontend/src/features/admin/components/service-management.tsx: CRUD service + update price.
- Frontend/src/features/admin/components/settings-management.tsx: danh sach va cap nhat system settings.

### 13.4 Receptionist

- Frontend/src/features/receptionist/receptionist-page.tsx: tong hop, duyet lich, huy lich, phan luong pending/confirmed.
- Frontend/src/features/receptionist/components/dashboard-stats.tsx: thong ke le tan.
- Frontend/src/features/receptionist/components/pending-appointment.tsx: bang lich cho duyet.
- Frontend/src/features/receptionist/components/confirm-appointment.tsx: bang lich da duyet.
- Frontend/src/features/receptionist/components/confirm-modal.tsx: popup xac nhan + chon doctor.

### 13.5 Doctor

- Frontend/src/features/doctor/doctor-page.tsx: waiting/completed queue, tao benh an, ke toa, service result, complete kham.
- Frontend/src/features/doctor/components/medical-record-form.tsx: form benh an.
- Frontend/src/features/doctor/components/prescription-section.tsx: UI thao tac toa thuoc.
- Frontend/src/features/doctor/components/patient-info.tsx: thong tin benh nhan.

### 13.6 Cashier

- Frontend/src/features/cashier/cashier-page.tsx: danh sach cho thanh toan, xu ly payment method.
- Frontend/src/features/cashier/invoice-history.tsx: lich su giao dich va export invoice PDF.
- Frontend/src/features/cashier/components/pharmacy-stats.tsx: thong ke thu ngan.
- Frontend/src/features/cashier/components/pending-prescriptions.tsx: danh sach cho thanh toan.
- Frontend/src/features/cashier/components/dispensed-prescriptions.tsx: danh sach da thanh toan.
- Frontend/src/features/cashier/components/payment-dialog.tsx: dialog xac nhan thanh toan.

### 13.7 Patient

- Frontend/src/features/patient/dashboard/dashboard.tsx: tong quan benh nhan + lich sap toi.
- Frontend/src/features/patient/appointments/appointments.tsx: filter trang thai, search, thong bao he thong, huy lich.
- Frontend/src/features/patient/booking/booking-page.tsx: wrapper trang dat lich.
- Frontend/src/features/patient/booking/components/booking-form.tsx: form dat lich va validate.
- Frontend/src/features/patient/patient-history/patient-history.tsx: lich su benh an + toa thuoc.
- Frontend/src/features/patient/invoices/invoices.tsx: lich su hoa don thanh toan.

## 14) Frontend - Services, hooks, shared components, types

### 14.1 Services (src/services)

| File                                         | Chuc nang                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Frontend/src/services/api.ts                 | Axios instance, auth header, auto refresh token khi gap 401, helper parse error. |
| Frontend/src/services/authService.ts         | Login/register/refresh/logout va forgot-password flow.                           |
| Frontend/src/services/adminService.ts        | Goi API admin module.                                                            |
| Frontend/src/services/patientService.ts      | Goi API patient module.                                                          |
| Frontend/src/services/receptionistService.ts | Goi API receptionist module.                                                     |
| Frontend/src/services/doctorService.ts       | Goi API doctor + medical-record workflow.                                        |
| Frontend/src/services/cashierService.ts      | Goi API cashier/payment workflow.                                                |
| Frontend/src/services/userService.ts         | Wrapper rieng cho user management (admin users).                                 |

### 14.2 Hooks (src/hooks)

- Frontend/src/hooks/useAuth.ts: state session, login/logout/register, forgot-password actions.
- Frontend/src/hooks/useReceptionistDashboard.ts: load du lieu dashboard le tan.
- Frontend/src/hooks/useFetch.ts: helper goi async va quan ly loading/error.
- Frontend/src/hooks/useDebounce.ts: debounce gia tri input.

### 14.3 Shared components (src/components)

- Chatbot:
  - Frontend/src/components/chatbot/floating-chatbot.tsx
  - Frontend/src/components/chatbot/floating-chatbot.module.css
  - Chuc nang: giao dien chat noi, goi /api/chatbot/ask, lay/xoa lich su cho user dang nhap.
- Layout:
  - Frontend/src/components/layout/brand-logo.tsx
  - Frontend/src/components/layout/brand-logo.module.css
- UI primitives:
  - button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx, select.tsx, tabs.tsx, textarea.tsx, badge.tsx, utils.ts

### 14.4 Types (src/types)

- Frontend/src/types/auth.ts
- Frontend/src/types/appointment.type.ts
- Frontend/src/types/doctor.type.ts
- Frontend/src/types/invoice.type.ts
- Frontend/src/types/medicine.type.ts
- Frontend/src/types/pharmacy.type.ts
- Frontend/src/types/record.type.ts
- Frontend/src/types/user.type.ts
- Frontend/src/types/styles.d.ts

## 15) Root scripts va tai lieu tong

| File                                    | Chuc nang                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| run-local.ps1                           | Checklist local env, start Redis, mo cua so Backend + Frontend de chay local. |
| run-local.cmd                           | Wrapper goi run-local.ps1 tren Windows CMD.                                   |
| README.md                               | Huong dan tong quan, chatbot Gemini, deploy Render + Vercel.                  |
| Backend/HE_THONG_PHONG_KHAM_TONG_HOP.md | Tai lieu tong hop nghiep vu backend.                                          |
| Backend/TAI_LIEU_HOC_NHANH_FE_BE.md     | Tai lieu hoc nhanh FE/BE.                                                     |

## 16) Ghi chu dong bo tai lieu

- Tai lieu nay duoc cap nhat theo source hien co ngay 2026-04-20.
- Khi them/sua/xoa file code o Backend hoac Frontend, can cap nhat lai tai lieu nay de tranh lech voi thuc te.
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
