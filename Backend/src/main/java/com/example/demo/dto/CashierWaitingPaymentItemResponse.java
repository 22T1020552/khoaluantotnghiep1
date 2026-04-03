package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CashierWaitingPaymentItemResponse {

    private Long invoiceId;
    private Long medicalRecordId;
    private Long patientId;
    private String patientName;
    private String phoneNumber;
    private LocalDateTime appointmentTime;
    private BigDecimal totalAmount;
    private String paymentStatus;
}