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

    @NotNull(message = "appointmentTime là bắt buộc")
    @FutureOrPresent(message = "appointmentTime phải từ thời điểm hiện tại trở đi")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;

    @NotBlank(message = "Triệu chứng là bắt buộc")
    @Size(min = 5, max = 500, message = "Triệu chứng phải từ 5 đến 500 ký tự")
    private String symptoms;

    // Legacy fields kept for backward compatibility.
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d-([01]\\d|2[0-3]):[0-5]\\d$", message = "timeSlot phải đúng định dạng HH:mm-HH:mm")
    private String timeSlot;

    @Size(min = 5, max = 500, message = "Ghi chú phải từ 5 đến 500 ký tự")
    private String notes;
}
