package com.example.demo.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReceptionistApproveRequest {

    private Long doctorId;

    @Size(max = 100, message = "specialty must be <= 100 characters")
    private String specialty;
}
