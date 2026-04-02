package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminMedicalServiceCreateRequest {

    @NotBlank(message = "serviceName is required")
    @Size(max = 100, message = "serviceName must be at most 100 characters")
    private String serviceName;

    @NotNull(message = "currentPrice is required")
    @DecimalMin(value = "0", message = "currentPrice must be greater than or equal to 0")
    private BigDecimal currentPrice;

    private Boolean isActive;
}