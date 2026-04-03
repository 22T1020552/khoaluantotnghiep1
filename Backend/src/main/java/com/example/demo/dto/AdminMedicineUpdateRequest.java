package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminMedicineUpdateRequest {

    @Size(max = 200, message = "medicineName must be at most 200 characters")
    private String medicineName;

    @Size(max = 50, message = "unit must be at most 50 characters")
    private String unit;

    @DecimalMin(value = "0", message = "sellingPrice must be greater than or equal to 0")
    private BigDecimal sellingPrice;

    @Min(value = 0, message = "stockQuantity must be greater than or equal to 0")
    private Integer stockQuantity;

    private Boolean isActive;
}