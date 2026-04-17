# Tai lieu chuc nang tat ca file code

Tai lieu nay duoc cap nhat theo cau truc hien tai cua workspace demo/demo.

## 1) Build va cau hinh

| File                                                                      | Chuc nang                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| pom.xml                                                                   | Cau hinh dependency Spring Boot 3.5.13, JPA, Security, Redis, Mail, JWT, PDFBox, OpenAPI. |
| mvnw, mvnw.cmd                                                            | Maven Wrapper cho Unix/Windows.                                                           |
| src/main/resources/application.properties                                 | Cau hinh PostgreSQL, Redis OTP, SMTP, JPA va server port.                                 |
| src/main/resources/META-INF/additional-spring-configuration-metadata.json | Metadata cho custom properties (goi y trong IDE).                                         |

## 2) Khoi dong ung dung

| File                                                | Chuc nang                          |
| --------------------------------------------------- | ---------------------------------- |
| src/main/java/com/example/demo/DemoApplication.java | Entry point khoi dong Spring Boot. |

## 3) Cau hinh he thong va bao mat

| File                                                                      | Chuc nang                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| src/main/java/com/example/demo/config/OpenApiConfig.java                  | Cau hinh Swagger/OpenAPI va bearerAuth.                             |
| src/main/java/com/example/demo/config/GeminiConfig.java                   | Khai bao bean RestTemplate/ObjectMapper cho module chatbot Gemini.  |
| src/main/java/com/example/demo/config/GeminiProperties.java               | Mapping cac bien cau hinh chatbot Gemini tu application.properties. |
| src/main/java/com/example/demo/config/SecurityConfig.java                 | Phan quyen endpoint theo role, session stateless, JWT filter.       |
| src/main/java/com/example/demo/config/CustomAuthenticationEntryPoint.java | Chuan hoa phan hoi 401 khi chua/xai sai JWT.                        |
| src/main/java/com/example/demo/config/CustomAccessDeniedHandler.java      | Chuan hoa phan hoi 403 khi khong du quyen role.                     |
| src/main/java/com/example/demo/security/JwtFilter.java                    | Trich token Bearer, nap SecurityContext cho request.                |

## 4) Controller (API layer)

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

## 5) Service (business layer)

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

## 6) Repository (data access)

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

## 7) Entity (domain model)

Danh sach entity hien tai:

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

## 8) DTO (request/response)

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

## 9) Exception handling

| File                                                                 | Chuc nang                                            |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| src/main/java/com/example/demo/exception/GlobalExceptionHandler.java | Chuan hoa loi tra ve API theo mot format thong nhat. |

## 10) Test

| File                                                     | Chuc nang                                 |
| -------------------------------------------------------- | ----------------------------------------- |
| src/test/java/com/example/demo/DemoApplicationTests.java | Smoke test khoi dong context Spring Boot. |

## 11) Script van hanh

| File                                                                                 | Chuc nang                                               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| scripts/start-redis.ps1, scripts/start-redis.cmd                                     | Khoi dong Redis local cho OTP flow.                     |
| scripts/stop-redis.ps1, scripts/stop-redis.cmd                                       | Dung Redis local va xoa marker pid.                     |
| scripts/migrate-sqlserver-to-postgres.ps1, scripts/migrate-sqlserver-to-postgres.cmd | Ho tro migrate du lieu SQL Server sang PostgreSQL.      |
| scripts/MIGRATE_SQLSERVER_TO_POSTGRES.md                                             | Huong dan chi tiet migration pipeline.                  |
| scripts/check-bom.ps1, scripts/remove-bom.ps1                                        | Kiem tra/xu ly BOM trong source file.                   |
| scripts/add-chatbot-history-postgres.sql                                             | Tao bang luu lich su hoi thoai chatbot tren PostgreSQL. |

## 12) Du lieu va tai nguyen lien quan

| Duong dan         | Mo ta                                                |
| ----------------- | ---------------------------------------------------- |
| ../../sqlKLTN.sql | File SQL nguon cu tai root workspace.                |
| ../migration-data | Thu muc tam cho du lieu migration (hien dang trong). |

## Ghi chu

- He thong hien tai dang van hanh tren PostgreSQL + Redis.
- Khi them/sua/xoa file nguon, can cap nhat lai tai lieu nay de dong bo.
