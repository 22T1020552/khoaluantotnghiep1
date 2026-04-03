package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CashierProcessPaymentResponse {

    private Long invoiceId;
    private Long medicalRecordId;
    private String paymentMethod;
    private BigDecimal totalServiceFee;
    private BigDecimal totalMedicineFee;
    private BigDecimal grossTotalAmount;
    private BigDecimal insuranceDiscountAmount;
    private BigDecimal totalAmount;
    private Boolean insuranceApplied;
    private LocalDateTime paidAt;
    private String transactionStatus;
    private Boolean invoiceExported;
    private String invoiceCode;
    private String message;
}
