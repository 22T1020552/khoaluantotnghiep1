package com.example.demo.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReceptionistApproveRequest {

    private Long doctorId;

    private LocalDateTime appointmentTime;

    @Size(max = 100, message = "Chuyên khoa tối đa 100 ký tự")
    private String specialty;
}
