package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminMedicineCreateRequest {

    @NotBlank(message = "Tên thuốc là bắt buộc")
    @Size(max = 200, message = "Tên thuốc tối đa 200 ký tự")
    private String medicineName;

    @Size(max = 50, message = "Đơn vị tối đa 50 ký tự")
    private String unit;

    @DecimalMin(value = "0", message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal sellingPrice;

    @Min(value = 0, message = "Số lượng tồn phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    private Boolean isActive;
}