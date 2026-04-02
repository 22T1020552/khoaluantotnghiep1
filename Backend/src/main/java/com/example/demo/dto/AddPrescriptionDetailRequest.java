package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddPrescriptionDetailRequest {

    @NotNull(message = "medicineId is required")
    private Long medicineId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be >= 1")
    private Integer quantity;

    @NotBlank(message = "usageInstructions is required")
    private String usageInstructions;
}
