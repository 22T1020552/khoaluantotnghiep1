package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentAssignDoctorRequest {

    @NotNull(message = "doctorId is required")
    private Long doctorId;
}
