package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PatientAppointmentRequest {

    // Optional for testing mode when no JWT is sent.
    private Long patientId;

    @NotNull(message = "appointmentTime is required")
    @FutureOrPresent(message = "appointmentTime must be now or later")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;

    @NotBlank(message = "symptoms is required")
    @Size(min = 5, max = 500, message = "symptoms must be between 5 and 500 characters")
    private String symptoms;

    // Legacy fields kept for backward compatibility.
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d-([01]\\d|2[0-3]):[0-5]\\d$", message = "timeSlot must be in HH:mm-HH:mm format")
    private String timeSlot;

    @Size(min = 5, max = 500, message = "notes must be between 5 and 500 characters")
    private String notes;
}
