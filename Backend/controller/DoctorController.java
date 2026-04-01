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
    description = "Nghiep vu bac si: danh sach bac si, hang doi cho kham, cap nhat phong va xem lich su benh an."
)
public class DoctorController {

    private final DoctorService doctorService;
    private final MedicalRecordService medicalRecordService;

    @GetMapping
    @Operation(summary = "Danh sach bac si", description = "Lay danh sach bac si hien co.")
    public List<DoctorResponse> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/me/waiting-patients")
    @Operation(summary = "Danh sach benh nhan dang cho", description = "Lay danh sach benh nhan dang cho kham cua bac si dang dang nhap.")
    public List<Appointment> getMyWaitingPatients(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return doctorService.getMyWaitingPatients(authentication.getName(), date);
    }

    @PutMapping("/{doctorId}/clinic-room")
    @Operation(summary = "Cap nhat phong kham", description = "Cap nhat thong tin phong kham phu trach cua bac si.")
    public DoctorResponse updateClinicRoom(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorClinicRoomRequest request) {
        return doctorService.updateClinicRoom(doctorId, request.getClinicRoom());
    }

    @GetMapping("/appointments/{appointmentId}/patient-history")
    @Operation(summary = "Lich su benh an tong quan", description = "Lay tong quan lich su benh an cua benh nhan theo cuoc hen.")
    public DoctorPatientHistoryResponse getPatientHistorySummary(
            Authentication authentication,
            @PathVariable Long appointmentId) {
        return medicalRecordService.getPatientHistorySummaryForDoctor(authentication.getName(), appointmentId);
    }

    @GetMapping("/appointments/{appointmentId}/patient-history/{medicalRecordId}")
    @Operation(summary = "Lich su benh an chi tiet", description = "Lay chi tiet mot benh an cu the de bac si doi chieu khi kham.")
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

