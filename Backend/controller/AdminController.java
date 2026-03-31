package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AdminCreateUserRequest;
import com.example.demo.dto.AdminMedicalServiceCreateRequest;
import com.example.demo.dto.AdminMedicalServiceResponse;
import com.example.demo.dto.AdminMedicalServiceUpdatePriceRequest;
import com.example.demo.dto.AdminMedicineCreateRequest;
import com.example.demo.dto.AdminMedicineResponse;
import com.example.demo.dto.AdminMedicineUpdateRequest;
import com.example.demo.dto.AdminRevenueReportResponse;
import com.example.demo.dto.AdminRoomAssignDoctorRequest;
import com.example.demo.dto.AdminRoomCreateRequest;
import com.example.demo.dto.AdminRoomResponse;
import com.example.demo.dto.AdminRoomUpdateRequest;
import com.example.demo.dto.AdminUpdateUserRequest;
import com.example.demo.dto.AdminUserResponse;
import com.example.demo.dto.DashboardResponse;
import com.example.demo.service.AdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(
    name = "Admin",
    description = "Quan tri he thong: dashboard, bao cao doanh thu, nguoi dung, phong kham, thuoc va dich vu."
)
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard tong quan", description = "Lay so lieu tong hop cho trang quan tri.")
    // Chức năng: xử lý lấy số liệu thống kê.
    public DashboardResponse getDashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/revenue-report")
    @Operation(summary = "Bao cao doanh thu", description = "Lay bao cao doanh thu co bo loc thoi gian, dich vu, thuoc va kieu gom nhom.")
    // Chức năng: xử lý lấy báo cáo doanh thu và biểu đồ.
    public AdminRevenueReportResponse getRevenueReport(
            @RequestParam(required = false) java.time.LocalDateTime startTime,
            @RequestParam(required = false) java.time.LocalDateTime endTime,
            @RequestParam(required = false) String serviceFilter,
            @RequestParam(required = false) String medicineFilter,
            @RequestParam(required = false, defaultValue = "DAY") String groupBy) {
        return adminService.getRevenueReport(startTime, endTime, serviceFilter, medicineFilter, groupBy);
    }

    @GetMapping("/revenue-report/export")
    @Operation(summary = "Xuat bao cao doanh thu", description = "Xuat bao cao doanh thu sang CSV hoac PDF.")
    // Chức năng: xử lý xuất báo cáo sang dạng CSV/PDF.
    public ResponseEntity<byte[]> exportRevenueReport(
            @RequestParam(required = false) java.time.LocalDateTime startTime,
            @RequestParam(required = false) java.time.LocalDateTime endTime,
            @RequestParam(required = false) String serviceFilter,
            @RequestParam(required = false) String medicineFilter,
            @RequestParam(required = false, defaultValue = "DAY") String groupBy,
            @RequestParam(defaultValue = "CSV") String format) {
        byte[] fileBytes = adminService.exportRevenueReport(startTime, endTime, serviceFilter, medicineFilter, groupBy, format);
        String normalized = format == null ? "CSV" : format.trim().toUpperCase(java.util.Locale.ROOT);
        String fileName = "revenue-report." + ("PDF".equals(normalized) ? "pdf" : "csv");
        MediaType mediaType = "PDF".equals(normalized) ? MediaType.APPLICATION_PDF : MediaType.TEXT_PLAIN;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(mediaType)
                .contentLength(fileBytes.length)
                .body(fileBytes);
    }

    @GetMapping("/users")
    @Operation(summary = "Danh sach nguoi dung", description = "Lay toan bo nguoi dung trong he thong.")
    // Chức năng: xử lý lấy danh sách người dùng.
    public List<AdminUserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PostMapping("/users")
    @Operation(summary = "Tao nguoi dung", description = "Tao moi user voi role tuong ung trong he thong.")
    // Chức năng: xử lý tạo người dùng.
    public AdminUserResponse createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return adminService.createUser(request);
    }

    @PutMapping("/users/{userId}")
    @Operation(summary = "Cap nhat nguoi dung", description = "Cap nhat thong tin va trang thai user theo userId.")
    // Chức năng: xử lý cập nhật người dùng.
    public AdminUserResponse updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        return adminService.updateUser(userId, request);
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Xoa nguoi dung", description = "Vo hieu hoa hoac xoa user theo userId.")
    // Chức năng: xử lý xóa user.
    public void deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
    }

    @GetMapping("/rooms")
    @Operation(summary = "Danh sach phong", description = "Lay danh sach phong kham hien co.")
    // Chức năng: xử lý lấy tất cả phòng khám.
    public List<AdminRoomResponse> getAllRooms() {
        return adminService.getAllRooms();
    }

    @PostMapping("/rooms")
    @Operation(summary = "Tao phong", description = "Tao phong kham moi.")
    // Chức năng: xử lý tạo phòng khám.
    public AdminRoomResponse createRoom(@Valid @RequestBody AdminRoomCreateRequest request) {
        return adminService.createRoom(request.getRoomName());
    }

    @PutMapping("/rooms/{roomId}")
    @Operation(summary = "Cap nhat phong", description = "Cap nhat ten phong kham.")
    // Chức năng: xử lý cập nhật thông tin phòng khám.
    public AdminRoomResponse updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody AdminRoomUpdateRequest request) {
        return adminService.updateRoom(roomId, request.getRoomName());
    }

    @PutMapping("/rooms/{roomId}/assign-doctor")
    @Operation(summary = "Gan bac si vao phong", description = "Phan cong bac si phu trach phong kham.")
    // Chức năng: xử lý phân bác sĩ vào phòng khám.
    public AdminRoomResponse assignDoctorToRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody AdminRoomAssignDoctorRequest request) {
        return adminService.assignDoctorToRoom(roomId, request.getDoctorId());
    }

    @GetMapping("/medicines")
    @Operation(summary = "Danh sach thuoc", description = "Lay danh muc thuoc cho quan tri.")
    // Chức năng: xử lý lấy danh sách thuốc.
    public List<AdminMedicineResponse> getAllMedicines() {
        return adminService.getAllMedicines();
    }

    @PostMapping("/medicines")
    @Operation(summary = "Tao thuoc", description = "Them thuoc moi vao danh muc.")
    // Chức năng: xử lý thêm thuốc mới.
    public AdminMedicineResponse createMedicine(@Valid @RequestBody AdminMedicineCreateRequest request) {
        return adminService.createMedicine(request);
    }

    @PutMapping("/medicines/{medicineId}")
    @Operation(summary = "Cap nhat thuoc", description = "Cap nhat thong tin thuoc theo medicineId.")
    // Chức năng: xử lý cập nhật thông tin thuốc.
    public AdminMedicineResponse updateMedicine(
            @PathVariable Long medicineId,
            @Valid @RequestBody AdminMedicineUpdateRequest request) {
        return adminService.updateMedicine(medicineId, request);
    }

    @DeleteMapping("/medicines/{medicineId}")
    @Operation(summary = "Ngung su dung thuoc", description = "Vo hieu hoa thuoc trong danh muc.")
    // Chức năng: xử lý vô hiệu hóa thuốc.
    public void deactivateMedicine(@PathVariable Long medicineId) {
        adminService.deactivateMedicine(medicineId);
    }

    @GetMapping("/services")
    @Operation(summary = "Danh sach dich vu", description = "Lay danh muc dich vu y te.")
    // Chức năng: xử lý lấy tất cả dịch vụ.
    public List<AdminMedicalServiceResponse> getAllMedicalServices() {
        return adminService.getAllMedicalServices();
    }

    @PostMapping("/services")
    @Operation(summary = "Tao dich vu", description = "Them dich vu y te moi.")
    // Chức năng: xử lý thêm dịch vụ mới.
    public AdminMedicalServiceResponse createMedicalService(
            @Valid @RequestBody AdminMedicalServiceCreateRequest request) {
        return adminService.createMedicalService(request);
    }

    @PutMapping("/services/{serviceId}/price")
    @Operation(summary = "Cap nhat gia dich vu", description = "Cap nhat gia hien hanh cua dich vu.")
    // Chức năng: xử lý cập nhật giá dịch vụ.
    public AdminMedicalServiceResponse updateMedicalServicePrice(
            @PathVariable Long serviceId,
            @Valid @RequestBody AdminMedicalServiceUpdatePriceRequest request) {
        return adminService.updateMedicalServicePrice(serviceId, request.getCurrentPrice());
    }

    @DeleteMapping("/services/{serviceId}")
    @Operation(summary = "Ngung su dung dich vu", description = "Vo hieu hoa dich vu y te trong danh muc.")
    // Chức năng: xử lý vô hiệu hóa dịch vụ.
    public void deactivateMedicalService(@PathVariable Long serviceId) {
        adminService.deactivateMedicalService(serviceId);
    }
}

