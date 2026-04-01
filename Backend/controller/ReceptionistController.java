package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ReceptionistApproveRequest;
import com.example.demo.dto.ReceptionistCancelAppointmentRequest;
import com.example.demo.dto.ReceptionistDoctorOptionResponse;
import com.example.demo.dto.ReceptionistWaitingStatusUpdateRequest;
import com.example.demo.entity.Appointment;
import com.example.demo.service.ReceptionistService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
@Tag(
    name = "Receptionist",
    description = "Nghiep vu le tan: duyet lich hen, phan cong bac si, quan ly hang doi cho kham va huy lich.")
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @GetMapping("/appointments/today")
    @Operation(summary = "Lich hen hom nay")
    public List<Appointment> getTodayAppointments() {
        return receptionistService.getTodayAppointments();
    }

    @GetMapping("/appointments/from-booking")
    @Operation(summary = "Lich hen tu kenh dat lich")
    public List<Appointment> getFromBookingList() {
        return receptionistService.getAppointmentsFromBookingList();
    }

    @GetMapping("/doctors/by-specialty")
    @Operation(summary = "Danh sach bac si theo chuyen khoa")
    public List<ReceptionistDoctorOptionResponse> getDoctorsBySpecialty(
            @RequestParam(required = false) String specialty) {
        return receptionistService.getDoctorsBySpecialty(specialty);
    }

    @PutMapping("/appointments/{appointmentId}/approve")
    @Operation(summary = "Duyet lich hen")
    public Appointment approveAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody ReceptionistApproveRequest request) {
        return receptionistService.approveAppointment(appointmentId, request.getDoctorId(), request.getSpecialty());
    }

    @PutMapping("/appointments/{appointmentId}/assign-doctor")
    @Operation(summary = "Phan cong bac si va chuyen hang cho")
    public Appointment assignDoctorAndMoveToWaiting(
            @PathVariable Long appointmentId,
            @Valid @RequestBody ReceptionistApproveRequest request) {
        return receptionistService.assignDoctorAndMoveToWaiting(appointmentId, request.getDoctorId(), request.getSpecialty());
    }

    @GetMapping("/appointments/waiting")
    @Operation(summary = "Hang doi cho kham")
    public List<Appointment> getWaitingQueue(@RequestParam(required = false) String status) {
        return receptionistService.getWaitingQueue(status);
    }

    @PutMapping("/appointments/{appointmentId}/waiting-status")
    @Operation(summary = "Cap nhat trang thai hang cho")
    public Appointment updateWaitingStatus(
            @PathVariable Long appointmentId,
            @Valid @RequestBody ReceptionistWaitingStatusUpdateRequest request) {
        return receptionistService.updateWaitingStatus(appointmentId, request.getStatus());
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    @Operation(summary = "Huy lich hen boi le tan")
    public Appointment cancelAppointmentByReceptionist(
            @PathVariable Long appointmentId,
            @RequestBody ReceptionistCancelAppointmentRequest request) {
        return receptionistService.cancelAppointmentByReceptionist(
                appointmentId,
                request == null ? null : request.getCancellationReason(),
                request == null ? null : request.getRequireReason()
        );
    }
}

