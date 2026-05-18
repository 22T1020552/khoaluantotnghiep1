package com.example.demo.controller;

import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CashierProcessPaymentRequest;
import com.example.demo.dto.CashierProcessPaymentResponse;
import com.example.demo.service.InvoiceService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final InvoiceService invoiceService;
    private final com.example.demo.repository.PaymentTransactionRepository paymentTransactionRepository;
    private final com.example.demo.repository.InvoiceRepository invoiceRepository;

    @Value("${payments.webhook.secret:}")
    private String webhookSecret;

    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Webhook callback for external payments", description = "Process payment notifications from VNPAY/Momo.")
    public ResponseEntity<?> handleWebhook(
            @RequestBody WebhookPayload payload,
            @RequestParam(name = "signature", required = false) String signature) {

        if (payload == null || payload.getInvoiceId() == null || payload.getExternalTransactionId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing invoiceId or externalTransactionId");
        }

        // Xác minh chữ ký nếu có mã bí mật được cung cấp.
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            boolean ok = verifySignature(signature, payload);
            if (!ok) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
            }
        }

        // Tính bất biến: kiểm tra giao dịch hiện có
        java.util.Optional<com.example.demo.entity.PaymentTransaction> existing = paymentTransactionRepository
                .findByExternalTransactionId(payload.getExternalTransactionId());
        if (existing.isPresent() && "SUCCESS".equalsIgnoreCase(existing.get().getStatus())) {
            return ResponseEntity.ok("Already processed");
        }

        // Tạo hồ sơ giao dịch
        com.example.demo.entity.PaymentTransaction tx = new com.example.demo.entity.PaymentTransaction();
        tx.setExternalTransactionId(payload.getExternalTransactionId());
        tx.setProvider(payload.getProvider());
        tx.setAmount(payload.getAmount());
        tx.setReceivedAt(java.time.LocalDateTime.now());
        tx.setRawPayload(payload.getRawPayload());

        // Hãy thử giải quyết hóa đơn theo ID nếu có.
        com.example.demo.entity.Invoice invoice = null;
        Long payloadInvoiceId = payload == null ? null : payload.getInvoiceId();
        Long payloadMedicalId = payload == null ? null : payload.getMedicalRecordId();
        if (payloadInvoiceId != null) {
            invoice = invoiceRepository.findById(payloadInvoiceId).orElse(null);
            if (invoice == null && payloadMedicalId != null) {
                invoice = invoiceRepository.findByMedicalRecord_Id(payloadMedicalId).orElse(null);
            }
        } else if (payloadMedicalId != null) {
            invoice = invoiceRepository.findByMedicalRecord_Id(payloadMedicalId).orElse(null);
        }

        // Giao dịch vẫn tiếp diễn (chưa có liên kết hóa đơn)
        paymentTransactionRepository.save(tx);

        // If webhook indicates success, process payment on invoice
        if ("SUCCESS".equalsIgnoreCase(payload.getStatus()) && invoice != null) {
            CashierProcessPaymentRequest request = new CashierProcessPaymentRequest();
            request.setPaymentMethod(payload.getPaymentMethod() == null ? "CHUYEN_KHOAN" : payload.getPaymentMethod());
            request.setPaymentSuccessful(Boolean.TRUE);
            request.setExportInvoice(Boolean.FALSE);
            request.setApplyHealthInsurance(Boolean.FALSE);

            try {
                Long invoiceIdNullable = invoice.getId();
                if (invoiceIdNullable == null) {
                    tx.setStatus("FAILED");
                    paymentTransactionRepository.save(tx);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invoice id is null");
                }
                Long invoiceId = java.util.Objects.requireNonNull(invoiceIdNullable);

                CashierProcessPaymentResponse resp = invoiceService.processPayment(invoiceId, request);
                // Đính kèm hóa đơn vào giao dịch
                tx.setInvoice(invoice);
                tx.setStatus("SUCCESS");
                paymentTransactionRepository.save(tx);

                // Lưu trữ tham chiếu bên ngoài trên hóa đơn
                try {
                    invoice.setPaymentReference(payload.getExternalTransactionId());
                    invoiceRepository.save(invoice);
                } catch (Exception ex) {
                    // ignore persistence failures here
                }

                return ResponseEntity.ok(resp);
            } catch (Exception ex) {
                tx.setStatus("FAILED");
                paymentTransactionRepository.save(tx);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Processing failed: " + ex.getMessage());
            }
        }

        paymentTransactionRepository.save(tx);
        return ResponseEntity.ok("Received");
    }

    private boolean verifySignature(String signature, WebhookPayload payload) {
        if (signature == null || signature.isBlank())
            return false;
        try {
            String payloadStr = payload.getRawPayload() == null ? payload.toString() : payload.getRawPayload();
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    webhookSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmac = mac.doFinal(payloadStr.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String computed = java.util.Base64.getEncoder().encodeToString(hmac);
            return computed.equals(signature);
        } catch (Exception ex) {
            return false;
        }
    }

    public static class WebhookPayload {
        private Long invoiceId;
        private Long medicalRecordId;
        private String externalTransactionId;
        private String provider;
        private java.math.BigDecimal amount;
        private String rawPayload;
        private String status;
        private String paymentMethod;

        public Long getInvoiceId() {
            return invoiceId;
        }

        public void setInvoiceId(Long invoiceId) {
            this.invoiceId = invoiceId;
        }

        public Long getMedicalRecordId() {
            return medicalRecordId;
        }

        public void setMedicalRecordId(Long medicalRecordId) {
            this.medicalRecordId = medicalRecordId;
        }

        public String getExternalTransactionId() {
            return externalTransactionId;
        }

        public void setExternalTransactionId(String externalTransactionId) {
            this.externalTransactionId = externalTransactionId;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public java.math.BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(java.math.BigDecimal amount) {
            this.amount = amount;
        }

        public String getRawPayload() {
            return rawPayload;
        }

        public void setRawPayload(String rawPayload) {
            this.rawPayload = rawPayload;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }
}
