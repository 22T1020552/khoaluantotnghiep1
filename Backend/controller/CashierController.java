package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CashierPaymentRecordDetailResponse;
import com.example.demo.dto.CashierPrintReceiptResponse;
import com.example.demo.dto.CashierProcessPaymentRequest;
import com.example.demo.dto.CashierProcessPaymentResponse;
import com.example.demo.dto.CashierReceiptResponse;
import com.example.demo.dto.CashierTransactionHistoryResponse;
import com.example.demo.dto.CashierWaitingPaymentItemResponse;
import com.example.demo.entity.Invoice;
import com.example.demo.service.InvoiceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cashier")
@RequiredArgsConstructor
@Tag(
    name = "Cashier",
    description = "Nghiep vu thu ngan: hang doi thanh toan, xu ly giao dich, in bien lai va xuat hoa don PDF."
)
public class CashierController {

    private final InvoiceService invoiceService;

    @GetMapping("/payment-queue")
    @Operation(summary = "Hang doi cho thanh toan", description = "Lay danh sach ho so dang cho thu ngan xu ly.")
    // Chức năng: xử lý lấy tất cả hóa đơn đang chờ thanh toán.
    public List<CashierWaitingPaymentItemResponse> getWaitingPaymentQueue(
            @RequestParam(required = false) String keyword) {
        return invoiceService.getWaitingPaymentQueue(keyword);
    }

    @GetMapping("/payment-records/search")
    @Operation(summary = "Tim giao dich", description = "Tim thong tin thanh toan theo ma ho so, ten benh nhan hoac tu khoa.")
    // Chức năng: xử lý tìm kiếm hồ sơ thanh toán.
    public CashierPaymentRecordDetailResponse searchPaymentRecord(@RequestParam String keyword) {
        return invoiceService.searchPaymentRecord(keyword);
    }

    @GetMapping("/invoices/{invoiceId}/paid-detail")
    @Operation(summary = "Chi tiet hoa don da thanh toan", description = "Lay thong tin chi tiet giao dich da thanh toan de doi soat.")
    // Chức năng: xử lý lấy thông tin chi tiết hóa đơn đã thanh toán.
    public CashierPaymentRecordDetailResponse getPaidInvoiceDetail(@PathVariable Long invoiceId) {
        return invoiceService.getPaidInvoiceDetail(invoiceId);
    }

    @GetMapping("/transaction-history")
    @Operation(summary = "Lich su giao dich", description = "Thong ke giao dich theo khoang thoi gian va hinh thuc thanh toan.")
    public CashierTransactionHistoryResponse getTransactionHistory(
            @RequestParam(required = false) java.time.LocalDateTime startTime,
            @RequestParam(required = false) java.time.LocalDateTime endTime,
            @RequestParam(required = false) String paymentMethod) {
        return invoiceService.getTransactionHistory(startTime, endTime, paymentMethod);
    }


    @GetMapping("/invoices/by-medical-record")
    @Operation(summary = "Tim hoa don theo benh an", description = "Lay hoa don dua tren medicalRecordId.")
    public Invoice getInvoiceByMedicalRecordId(@RequestParam Long medicalRecordId) {
        return invoiceService.getByMedicalRecordId(medicalRecordId);
    }

    @PostMapping("/invoices/aggregate")
    @Operation(summary = "Tong hop hoa don", description = "Tong hop tien dich vu va thuoc tu benh an de tao hoa don thanh toan.")
    public Invoice aggregateInvoiceAmount(@RequestParam Long medicalRecordId) {
        return invoiceService.aggregateInvoiceAmount(medicalRecordId);
    }

    @PutMapping("/invoices/{invoiceId}/confirm-payment")
    @Operation(summary = "Xac nhan da thanh toan", description = "Danh dau hoa don da thanh toan thanh cong.")
    public Invoice confirmPayment(@PathVariable Long invoiceId) {
        return invoiceService.confirmPayment(invoiceId);
    }

    @PostMapping("/invoices/{invoiceId}/process-payment")
    @Operation(summary = "Xu ly thanh toan", description = "Xu ly thanh toan voi phuong thuc thanh toan va tuy chon xuat hoa don.")
    public CashierProcessPaymentResponse processPayment(
            @PathVariable Long invoiceId,
            @RequestBody CashierProcessPaymentRequest request) {
        return invoiceService.processPayment(invoiceId, request);
    }

    @GetMapping("/invoices/{invoiceId}/receipt")
    @Operation(summary = "Xem truoc bien lai", description = "Xem noi dung bien lai truoc khi in hoac xuat file.")
    public CashierReceiptResponse previewReceipt(@PathVariable Long invoiceId) {
        return invoiceService.previewReceipt(invoiceId);
    }

    @PostMapping("/invoices/{invoiceId}/print-receipt")
    @Operation(summary = "In bien lai", description = "Gui lenh in bien lai toi may in duoc chi dinh.")
    public CashierPrintReceiptResponse printReceipt(
            @PathVariable Long invoiceId,
            @RequestParam(required = false) String printerName) {
        return invoiceService.printReceipt(invoiceId, printerName);
    }

    @GetMapping("/invoices/{invoiceId}/export-pdf")
    @Operation(summary = "Xuat hoa don PDF", description = "Xuat hoa don dien tu dang PDF de tai ve.")
    public ResponseEntity<byte[]> exportInvoicePdf(@PathVariable Long invoiceId) {
        byte[] pdf = invoiceService.exportInvoicePdf(invoiceId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + invoiceId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}

