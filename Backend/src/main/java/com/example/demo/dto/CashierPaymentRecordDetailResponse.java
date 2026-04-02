package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CashierPaymentRecordDetailResponse {

    private Long invoiceId;
    private Long medicalRecordId;
    private Long patientId;
    private String patientName;
    private String phoneNumber;
    private LocalDateTime appointmentTime;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime paidAt;
    private BigDecimal totalServiceFee;
    private BigDecimal totalMedicineFee;
    private BigDecimal totalAmount;
    private List<CashierServiceLineItemResponse> services;
    private List<CashierMedicineLineItemResponse> medicines;
}