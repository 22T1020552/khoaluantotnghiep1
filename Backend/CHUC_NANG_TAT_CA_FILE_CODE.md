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

| File                                                      | Chuc nang                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| src/main/java/com/example/demo/config/OpenApiConfig.java  | Cau hinh Swagger/OpenAPI va bearerAuth.                       |
| src/main/java/com/example/demo/config/SecurityConfig.java | Phan quyen endpoint theo role, session stateless, JWT filter. |
| src/main/java/com/example/demo/security/JwtFilter.java    | Trich token Bearer, nap SecurityContext cho request.          |

## 4) Controller (API layer)

| File                                                                   | Chuc nang                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| src/main/java/com/example/demo/controller/AuthController.java          | Dang nhap, dang ky benh nhan, quy trinh quen mat khau OTP (send/verify/reset).        |
| src/main/java/com/example/demo/controller/AdminController.java         | Dashboard, bao cao doanh thu, quan ly users, rooms, medicines, services.              |
| src/main/java/com/example/demo/controller/AppointmentController.java   | Quan ly lich hen tong quat (list, waiting-assignment, tao lich, assign doctor).       |
| src/main/java/com/example/demo/controller/ReceptionistController.java  | Nghiep vu le tan: duyet/tu choi lich, waiting queue, tim doctor theo specialty.       |
| src/main/java/com/example/demo/controller/DoctorController.java        | Nghiep vu bac si: waiting patients, cap nhat phong, xem lich su benh an benh nhan.    |
| src/main/java/com/example/demo/controller/MedicalRecordController.java | Benh an va don thuoc: tao, cap nhat, workspace, quick-add, complete, service results. |
| src/main/java/com/example/demo/controller/CashierController.java       | Nghiep vu thu ngan: queue thanh toan, process payment, bien lai, export PDF, history. |
| src/main/java/com/example/demo/controller/PatientController.java       | Benh nhan: profile, dat/huy lich, xem lich hen va lich su benh an.                    |

## 5) Service (business layer)

| File                                                             | Chuc nang                                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| src/main/java/com/example/demo/service/AuthService.java          | Login/register, quen mat khau OTP tren Redis, rate-limit OTP, reset password.      |
| src/main/java/com/example/demo/service/JwtService.java           | Tao va parse JWT.                                                                  |
| src/main/java/com/example/demo/service/NotificationService.java  | Gui email OTP, thong bao dat lich moi, thong bao duyet/tu choi lich cho benh nhan. |
| src/main/java/com/example/demo/service/AdminService.java         | Nghiep vu admin va bao cao doanh thu.                                              |
| src/main/java/com/example/demo/service/AppointmentService.java   | Tao lich kham, assign doctor, quan ly lich benh nhan.                              |
| src/main/java/com/example/demo/service/ReceptionistService.java  | Xu ly waiting queue, approve/cancel appointment, dieu phoi doctor.                 |
| src/main/java/com/example/demo/service/DoctorService.java        | Danh sach doctor, waiting patients, clinic room.                                   |
| src/main/java/com/example/demo/service/MedicalRecordService.java | Nghiep vu benh an, don thuoc, service results, prescription workspace.             |
| src/main/java/com/example/demo/service/InvoiceService.java       | Tong hop vien phi, xu ly thanh toan, in/xuat hoa don, lich su giao dich.           |
| src/main/java/com/example/demo/service/PatientService.java       | Truy xuat thong tin benh nhan va lich su benh an cho role PATIENT.                 |

## 6) Repository (data access)

| File                                                                                | Chuc nang                                           |
| ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| src/main/java/com/example/demo/repository/AppointmentRepository.java                | Truy van lich hen theo doctor, status, thoi gian.   |
| src/main/java/com/example/demo/repository/InvoiceRepository.java                    | Truy van hoa don va giao dich thanh toan.           |
| src/main/java/com/example/demo/repository/MedicalRecordRepository.java              | Truy van benh an.                                   |
| src/main/java/com/example/demo/repository/MedicalRecordServiceDetailRepository.java | Truy van ket qua dich vu can lam sang theo benh an. |
| src/main/java/com/example/demo/repository/MedicalServiceRepository.java             | Truy van danh muc dich vu y te.                     |
| src/main/java/com/example/demo/repository/MedicineRepository.java                   | Truy van danh muc thuoc.                            |
| src/main/java/com/example/demo/repository/PatientRepository.java                    | Truy van benh nhan (co tim theo gmail).             |
| src/main/java/com/example/demo/repository/PrescriptionDetailRepository.java         | Truy van chi tiet don thuoc.                        |
| src/main/java/com/example/demo/repository/RoomRepository.java                       | Truy van phong kham va doctor hien tai theo phong.  |
| src/main/java/com/example/demo/repository/UserRepository.java                       | Truy van tai khoan theo username/role/trang thai.   |

## 7) Entity (domain model)

Danh sach entity hien tai:

- src/main/java/com/example/demo/entity/Appointment.java
- src/main/java/com/example/demo/entity/Invoice.java
- src/main/java/com/example/demo/entity/MedicalRecord.java
- src/main/java/com/example/demo/entity/MedicalRecordServiceDetail.java
- src/main/java/com/example/demo/entity/MedicalRecordServiceId.java
- src/main/java/com/example/demo/entity/MedicalService.java
- src/main/java/com/example/demo/entity/Medicine.java
- src/main/java/com/example/demo/entity/Patient.java
- src/main/java/com/example/demo/entity/PrescriptionDetail.java
- src/main/java/com/example/demo/entity/PrescriptionDetailId.java
- src/main/java/com/example/demo/entity/Role.java
- src/main/java/com/example/demo/entity/Room.java
- src/main/java/com/example/demo/entity/User.java

## 8) DTO (request/response)

Tat ca DTO hien tai tai folder src/main/java/com/example/demo/dto:

- AddPrescriptionDetailRequest.java
- AdminCreateUserRequest.java
- AdminMedicalServiceCreateRequest.java
- AdminMedicalServiceResponse.java
- AdminMedicalServiceUpdatePriceRequest.java
- AdminMedicineCreateRequest.java
- AdminMedicineResponse.java
- AdminMedicineUpdateRequest.java
- AdminRevenueChartPointResponse.java
- AdminRevenueReportItemResponse.java
- AdminRevenueReportResponse.java
- AdminRoomAssignDoctorRequest.java
- AdminRoomCreateRequest.java
- AdminRoomResponse.java
- AdminRoomUpdateRequest.java
- AdminUpdateUserRequest.java
- AdminUserResponse.java
- AppointmentAssignDoctorRequest.java
- AppointmentRequest.java
- AuthResponse.java
- CashierMedicineLineItemResponse.java
- CashierPaymentRecordDetailResponse.java
- CashierPrintReceiptResponse.java
- CashierProcessPaymentRequest.java
- CashierProcessPaymentResponse.java
- CashierReceiptResponse.java
- CashierServiceLineItemResponse.java
- CashierTransactionHistoryItemResponse.java
- CashierTransactionHistoryResponse.java
- CashierWaitingPaymentItemResponse.java
- CreateMedicalRecordRequest.java
- DashboardResponse.java
- DoctorClinicRoomRequest.java
- DoctorPatientHistoryDetailResponse.java
- DoctorPatientHistoryResponse.java
- DoctorPatientHistoryRowResponse.java
- DoctorPatientPrescriptionItemResponse.java
- DoctorPatientServiceItemResponse.java
- DoctorResponse.java
- ForgotPasswordRequest.java
- LoginRequest.java
- PatientAppointmentRequest.java
- PatientMedicalRecordDetailResponse.java
- PatientMedicalRecordHistoryItemResponse.java
- PatientPrefillResponse.java
- PatientPrescriptionHistoryItemResponse.java
- PatientRegisterRequest.java
- PrescriptionAutosaveResponse.java
- PrescriptionCatalogMedicineResponse.java
- PrescriptionLineResponse.java
- PrescriptionMedicineCatalogResponse.java
- PrescriptionWorkspaceResponse.java
- QuickAddPrescriptionMedicineRequest.java
- ReceptionistApproveRequest.java
- ReceptionistCancelAppointmentRequest.java
- ReceptionistDoctorOptionResponse.java
- ReceptionistWaitingStatusUpdateRequest.java
- ResetPasswordWithOtpRequest.java
- TopDoctorDTO.java
- UpdatePrescriptionDetailRequest.java
- UpsertMedicalRecordServiceResultRequest.java
- VerifyForgotPasswordOtpRequest.java

## 9) Exception handling

| File                                                                 | Chuc nang                                            |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| src/main/java/com/example/demo/exception/GlobalExceptionHandler.java | Chuan hoa loi tra ve API theo mot format thong nhat. |

## 10) Test

| File                                                     | Chuc nang                                 |
| -------------------------------------------------------- | ----------------------------------------- |
| src/test/java/com/example/demo/DemoApplicationTests.java | Smoke test khoi dong context Spring Boot. |

## 11) Script van hanh

| File                                                                                 | Chuc nang                                          |
| ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| scripts/start-redis.ps1, scripts/start-redis.cmd                                     | Khoi dong Redis local cho OTP flow.                |
| scripts/stop-redis.ps1, scripts/stop-redis.cmd                                       | Dung Redis local va xoa marker pid.                |
| scripts/migrate-sqlserver-to-postgres.ps1, scripts/migrate-sqlserver-to-postgres.cmd | Ho tro migrate du lieu SQL Server sang PostgreSQL. |
| scripts/MIGRATE_SQLSERVER_TO_POSTGRES.md                                             | Huong dan chi tiet migration pipeline.             |
| scripts/check-bom.ps1, scripts/remove-bom.ps1                                        | Kiem tra/xu ly BOM trong source file.              |

## 12) Du lieu va tai nguyen lien quan

| Duong dan         | Mo ta                                                |
| ----------------- | ---------------------------------------------------- |
| ../../sqlKLTN.sql | File SQL nguon cu tai root workspace.                |
| ../migration-data | Thu muc tam cho du lieu migration (hien dang trong). |

## Ghi chu

- He thong hien tai dang van hanh tren PostgreSQL + Redis.
- Module AI chatbox va endpoint login-legacy khong con trong code hien tai.
- Khi them/sua/xoa file nguon, can cap nhat lai tai lieu nay de dong bo.
