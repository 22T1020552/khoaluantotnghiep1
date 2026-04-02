package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReceptionistWaitingStatusUpdateRequest {

    @NotBlank(message = "status is required")
    private String status;
}
