package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMedicalRecordRequest {

    @NotNull(message = "appointmentId is required")
    private Long appointmentId;

    @NotBlank(message = "diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "doctorAdvice is required")
    private String doctorAdvice;
}
