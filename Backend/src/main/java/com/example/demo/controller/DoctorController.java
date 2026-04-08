package com.example.demo.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.DoctorClinicRoomRequest;
import com.example.demo.dto.DoctorPatientHistoryDetailResponse;
import com.example.demo.dto.DoctorPatientHistoryResponse;
import com.example.demo.dto.DoctorResponse;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.MedicalService;
import com.example.demo.entity.Medicine;
import com.example.demo.service.DoctorService;
import com.example.demo.service.MedicalRecordService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(
    name = "Doctor",
    description = "Nghiệp vụ bac si: danh sach bac si, hang doi cho kham, cap nhat phong va xem lich su benh an."
)
public class DoctorController {

    private final DoctorService doctorService;
    private final MedicalRecordService medicalRecordService;

    @GetMapping
    @Operation(summary = "Danh sách bác sĩ", description = "Lấy danh sách bác sĩ hiện có.")
    public List<DoctorResponse> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/me/waiting-patients")
    @Operation(summary = "Danh sách bệnh nhân đang chờ", description = "Lấy danh sách bệnh nhân đang chờ khám của bác sĩ đang đăng nhập.")
    public List<Appointment> getMyWaitingPatients(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return doctorService.getMyWaitingPatients(authentication.getName(), date);
    }

    @GetMapping("/me/completed-patients")
    @Operation(summary = "Danh sách bệnh nhân đã khám", description = "Lấy danh sách bệnh nhân đã hoàn tất khám của bác sĩ đang đăng nhập.")
    public List<Appointment> getMyCompletedPatients(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return doctorService.getMyCompletedPatients(authentication.getName(), date);
    }

    @GetMapping("/me/medicines")
    @Operation(summary = "Danh mục thuốc cho bác sĩ", description = "Lấy danh mục thuốc đang hoạt động để bác sĩ kê đơn.")
    public List<Medicine> getAvailableMedicines() {
        return doctorService.getAvailableMedicines();
    }

    @GetMapping("/me/services")
    @Operation(summary = "Danh mục dịch vụ cho bác sĩ", description = "Lấy danh mục dịch vụ đang hoạt động để bác sĩ chỉ định thêm.")
    public List<MedicalService> getAvailableServices() {
        return doctorService.getAvailableServices();
    }

    @PutMapping("/{doctorId}/clinic-room")
    @Operation(summary = "Cập nhật phòng kham", description = "Cập nhật thông tin phòng khám phụ trách của bác sĩ.")
    public DoctorResponse updateClinicRoom(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorClinicRoomRequest request) {
        return doctorService.updateClinicRoom(doctorId, request.getClinicRoom());
    }

    @GetMapping("/appointments/{appointmentId}/patient-history")
    @Operation(summary = "Lịch sử bệnh án tổng quan", description = "Lấy tổng quan lịch sử bệnh án của bệnh nhân theo cuộc hẹn.")
    public DoctorPatientHistoryResponse getPatientHistorySummary(
            Authentication authentication,
            @PathVariable Long appointmentId) {
        return medicalRecordService.getPatientHistorySummaryForDoctor(authentication.getName(), appointmentId);
    }

    @GetMapping("/appointments/{appointmentId}/patient-history/{medicalRecordId}")
    @Operation(summary = "Lịch sử bệnh án chi tiết", description = "Lấy chi tiết một bệnh án cụ thể để bác sĩ đối chiếu khi khám.")
    public DoctorPatientHistoryDetailResponse getPatientHistoryDetail(
            Authentication authentication,
            @PathVariable Long appointmentId,
            @PathVariable Long medicalRecordId) {
        return medicalRecordService.getPatientHistoryDetailForDoctor(
                authentication.getName(),
                appointmentId,
                medicalRecordId
        );
    }
}

