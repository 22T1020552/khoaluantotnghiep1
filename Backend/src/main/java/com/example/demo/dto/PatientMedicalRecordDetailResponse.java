package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientMedicalRecordDetailResponse {

    private Long medicalRecordId;
    private Long appointmentId;
    private LocalDateTime appointmentTime;
    private String appointmentStatus;
    private String doctorUsername;
    private String diagnosis;
    private String doctorAdvice;
    private LocalDateTime createdAt;
    private List<PatientPrescriptionHistoryItemResponse> prescriptionItems;
}