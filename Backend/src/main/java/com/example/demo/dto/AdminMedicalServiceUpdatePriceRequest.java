package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminMedicalServiceUpdatePriceRequest {

    @NotNull(message = "currentPrice is required")
    @DecimalMin(value = "0", message = "currentPrice must be greater than or equal to 0")
    private BigDecimal currentPrice;
}