package com.example.demo.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import javax.print.Doc;
import javax.print.DocFlavor;
import javax.print.DocPrintJob;
import javax.print.PrintException;
import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import javax.print.SimpleDoc;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CashierMedicineLineItemResponse;
import com.example.demo.dto.CashierPaymentRecordDetailResponse;
import com.example.demo.dto.CashierPrintReceiptResponse;
import com.example.demo.dto.CashierProcessPaymentRequest;
import com.example.demo.dto.CashierProcessPaymentResponse;
import com.example.demo.dto.CashierReceiptResponse;
import com.example.demo.dto.CashierServiceLineItemResponse;
import com.example.demo.dto.CashierTransactionHistoryItemResponse;
import com.example.demo.dto.CashierTransactionHistoryResponse;
import com.example.demo.dto.CashierWaitingPaymentItemResponse;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.MedicalRecord;
import com.example.demo.entity.MedicalRecordServiceDetail;
import com.example.demo.entity.Medicine;
import com.example.demo.entity.Patient;
import com.example.demo.entity.PrescriptionDetail;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.MedicalRecordServiceDetailRepository;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.repository.PrescriptionDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private static final String STATUS_WAITING_PAYMENT = "CHO_THANH_TOAN";
    private static final String STATUS_PAID = "DA_THANH_TOAN";
    private static final String TRANSACTION_SUCCESS = "THANH_TOAN_THANH_CONG";
    private static final String CLINIC_NAME = "Phong Kham Tong Hop";
    private static final String CLINIC_LOGO_TEXT = "[LOGO PHONG KHAM]";
    private static final DateTimeFormatter RECEIPT_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Set<String> SUPPORTED_PAYMENT_METHODS = Set.of("TIEN_MAT", "CHUYEN_KHOAN", "POS");
    private static final BigDecimal HEALTH_INSURANCE_DISCOUNT_RATE = new BigDecimal("0.70");

    private final InvoiceRepository invoiceRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordServiceDetailRepository medicalRecordServiceDetailRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository;

    // Chức năng: xử lý lấy thông tin theo mã số hồ sơ y tế.
    public Invoice getByMedicalRecordId(Long medicalRecordId) {
        return invoiceRepository.findByMedicalRecord_Id(medicalRecordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found for this medical record"));
    }

    // Chức năng: xử lý lấy hàng đợi chờ thanh toán.
    public List<CashierWaitingPaymentItemResponse> getWaitingPaymentQueue(String keyword) {
        List<Invoice> unpaidInvoices = invoiceRepository.findByIsPaidFalseOrderByIdDesc();

        if (keyword == null || keyword.isBlank()) {
            return unpaidInvoices.stream()
                    .map(this::toWaitingPaymentItemResponse)
                    .toList();
        }

        String normalizedKeyword = normalizeKeyword(keyword);
        List<CashierWaitingPaymentItemResponse> matched = unpaidInvoices.stream()
                .filter(invoice -> matchesKeyword(invoice, normalizedKeyword))
                .map(this::toWaitingPaymentItemResponse)
                .toList();

        if (matched.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay ho so");
        }

        return matched;
    }

    // Chức năng: xử lý tìm kiếm hồ sơ thanh toán.
    public CashierPaymentRecordDetailResponse searchPaymentRecord(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "keyword is required");
        }

        String normalizedKeyword = normalizeKeyword(keyword);
        Optional<Invoice> matchedInvoice = invoiceRepository.findAllByOrderByIdDesc().stream()
                .filter(invoice -> matchesKeyword(invoice, normalizedKeyword))
                .findFirst();

        Invoice invoice = matchedInvoice
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay ho so"));

        if (Boolean.TRUE.equals(invoice.getIsPaid())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ho so da thanh toan");
        }

        return toPaymentRecordDetailResponse(invoice);
    }

    // Chức năng: xử lý lấy chi tiết hóa đơn đã thanh toán cho lịch sử của lễ tân.
    public CashierPaymentRecordDetailResponse getPaidInvoiceDetail(Long invoiceId) {
        Invoice invoice = getPaidInvoiceOrThrow(invoiceId);
        return toPaymentRecordDetailResponse(invoice);
    }

    // Chức năng: xử lý lấy lịch sử giao dịch đã thanh toán cho ngày hiện tại hoặc khoảng ca làm việc.
    public CashierTransactionHistoryResponse getTransactionHistory(
            LocalDateTime startTime,
            LocalDateTime endTime,
            String paymentMethod) {
        LocalDateTime resolvedStartTime = startTime;
        LocalDateTime resolvedEndTime = endTime;

        if (resolvedStartTime == null || resolvedEndTime == null) {
            LocalDate today = LocalDate.now();
            if (resolvedStartTime == null) {
                resolvedStartTime = today.atStartOfDay();
            }
            if (resolvedEndTime == null) {
                resolvedEndTime = LocalDateTime.now();
            }
        }

        if (resolvedStartTime.isAfter(resolvedEndTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime must be before endTime");
        }

        String normalizedFilter = normalizePaymentMethodFilter(paymentMethod);
        List<Invoice> paidInvoices;
        if (normalizedFilter == null) {
            paidInvoices = invoiceRepository.findByIsPaidTrueAndPaidAtBetweenOrderByPaidAtDesc(resolvedStartTime, resolvedEndTime);
        } else {
            paidInvoices = invoiceRepository.findByIsPaidTrueAndPaymentMethodAndPaidAtBetweenOrderByPaidAtDesc(
                    normalizedFilter,
                    resolvedStartTime,
                    resolvedEndTime
            );
        }

        List<CashierTransactionHistoryItemResponse> items = paidInvoices.stream()
                .map(this::toTransactionHistoryItem)
                .toList();

        BigDecimal totalAmount = paidInvoices.stream()
                .map(Invoice::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCash = sumAmountByPaymentMethod(paidInvoices, "TIEN_MAT");
        BigDecimal totalBankTransfer = sumAmountByPaymentMethod(paidInvoices, "CHUYEN_KHOAN");
        BigDecimal totalPos = sumAmountByPaymentMethod(paidInvoices, "POS");

        return new CashierTransactionHistoryResponse(
                resolvedStartTime,
                resolvedEndTime,
                normalizedFilter == null ? "ALL" : normalizedFilter,
                items.size(),
                totalAmount,
                totalCash,
                totalBankTransfer,
                totalPos,
                items
        );
    }

    // Chức năng: xử lý tổng hợp số tiền hóa đơn.
    public Invoice aggregateInvoiceAmount(Long medicalRecordId) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical record not found"));

        Invoice invoice = invoiceRepository.findByMedicalRecord_Id(medicalRecordId).orElseGet(Invoice::new);
        if (Boolean.TRUE.equals(invoice.getIsPaid())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice already paid and cannot be recalculated");
        }

        List<MedicalRecordServiceDetail> serviceDetails =
                medicalRecordServiceDetailRepository.findByMedicalRecord_Id(medicalRecordId);
        BigDecimal totalServiceFee = serviceDetails.stream()
                .map(this::serviceLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PrescriptionDetail> prescriptionDetails =
                prescriptionDetailRepository.findByMedicalRecord_Id(medicalRecordId);
        BigDecimal totalMedicineFee = prescriptionDetails.stream()
                .map(this::medicineLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAmount = totalServiceFee.add(totalMedicineFee);

        invoice.setMedicalRecord(medicalRecord);
        invoice.setTotalServiceFee(totalServiceFee);
        invoice.setTotalMedicineFee(totalMedicineFee);
        invoice.setTotalAmount(totalAmount);
        if (invoice.getIsPaid() == null) {
            invoice.setIsPaid(false);
        }
        if (!Boolean.TRUE.equals(invoice.getIsPaid())) {
            invoice.setPaidAt(null);
        }

        return invoiceRepository.save(invoice);
    }

    @Transactional
    // Chức năng: xử lý xác nhận thanh toán.
    public Invoice confirmPayment(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (Boolean.TRUE.equals(invoice.getIsPaid())) {
            return invoice;
        }

        MedicalRecord medicalRecord = invoice.getMedicalRecord();
        if (medicalRecord == null || medicalRecord.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Medical record is required for payment");
        }

        Invoice recalculatedInvoice = aggregateInvoiceAmount(medicalRecord.getId());
        deductMedicineStockOnPayment(medicalRecord.getId());
        return markInvoiceAsPaidAndCloseSession(recalculatedInvoice);
    }

    @Transactional
    // Chức năng: Xử lý thanh toán với phương thức thanh toán và tùy chọn xuất hóa đơn.
    public CashierProcessPaymentResponse processPayment(Long invoiceId, CashierProcessPaymentRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request is required");
        }

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        if (!SUPPORTED_PAYMENT_METHODS.contains(paymentMethod)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phuong thuc thanh toan khong hop le. Ho tro: TIEN_MAT, CHUYEN_KHOAN, POS"
            );
        }
                ensureElectronicPaymentSucceeded(paymentMethod, request.getPaymentSuccessful());

        Invoice existingInvoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (Boolean.TRUE.equals(existingInvoice.getIsPaid())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ho so da thanh toan");
        }

        MedicalRecord medicalRecord = existingInvoice.getMedicalRecord();
        if (medicalRecord == null || medicalRecord.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Medical record is required for payment");
        }

        // Auto-refresh tong chi phi truoc khi thu tien.
        Invoice invoice = aggregateInvoiceAmount(medicalRecord.getId());
        BigDecimal grossTotalAmount = defaultAmount(invoice.getTotalAmount());

        Patient patient = medicalRecord.getAppointment() == null ? null : medicalRecord.getAppointment().getPatient();
        boolean applyHealthInsurance = Boolean.TRUE.equals(request.getApplyHealthInsurance());
        boolean eligibleHealthInsurance = hasHealthInsurance(patient);
        if (applyHealthInsurance && !eligibleHealthInsurance) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Patient does not have health insurance information"
            );
        }

        BigDecimal insuranceDiscountAmount = applyHealthInsurance
            ? calculateHealthInsuranceDiscount(grossTotalAmount)
            : BigDecimal.ZERO;
        BigDecimal payableTotalAmount = grossTotalAmount.subtract(insuranceDiscountAmount);
        invoice.setTotalAmount(payableTotalAmount);

        deductMedicineStockOnPayment(medicalRecord.getId());
        Invoice savedInvoice = markInvoiceAsPaidAndCloseSession(invoice, paymentMethod);
        LocalDateTime paidAt = savedInvoice.getPaidAt();
        boolean exportInvoice = Boolean.TRUE.equals(request.getExportInvoice());

        return new CashierProcessPaymentResponse(
                savedInvoice.getId(),
                medicalRecord.getId(),
                paymentMethod,
                savedInvoice.getTotalServiceFee(),
                savedInvoice.getTotalMedicineFee(),
                grossTotalAmount,
                insuranceDiscountAmount,
                savedInvoice.getTotalAmount(),
                applyHealthInsurance,
                paidAt,
                TRANSACTION_SUCCESS,
                exportInvoice,
                buildInvoiceCode(savedInvoice.getId(), paidAt),
                "Thanh toan thanh cong"
        );
    }

    // Chức năng: xử lý Xem trước nội dung biên lai sau khi thanh toán thành công.
    public CashierReceiptResponse previewReceipt(Long invoiceId) {
        Invoice invoice = getPaidInvoiceOrThrow(invoiceId);
        CashierPaymentRecordDetailResponse detail = toPaymentRecordDetailResponse(invoice);
        String formattedText = buildReceiptText(invoice, detail);

        return new CashierReceiptResponse(
                CLINIC_NAME,
                CLINIC_LOGO_TEXT,
                invoice.getId(),
                detail.getMedicalRecordId(),
                detail.getPatientName(),
                detail.getPhoneNumber(),
                invoice.getPaidAt(),
                detail.getServices(),
                detail.getMedicines(),
                detail.getTotalServiceFee(),
                detail.getTotalMedicineFee(),
                detail.getTotalAmount(),
                formattedText
        );
    }

    // Chức năng: xử lý In hóa đơn ra máy in nhiệt/laser được kết nối.
    public CashierPrintReceiptResponse printReceipt(Long invoiceId, String printerName) {
        Invoice invoice = getPaidInvoiceOrThrow(invoiceId);
        CashierPaymentRecordDetailResponse detail = toPaymentRecordDetailResponse(invoice);
        String formattedText = buildReceiptText(invoice, detail);

        PrintService targetPrinter = resolvePrinter(printerName);
        try {
            DocPrintJob printJob = targetPrinter.createPrintJob();
            Doc doc = new SimpleDoc(formattedText, DocFlavor.STRING.TEXT_PLAIN, null);
            printJob.print(doc, null);
        } catch (PrintException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Khong the gui lenh in", ex);
        }

        return new CashierPrintReceiptResponse(
                invoiceId,
                targetPrinter.getName(),
                "PRINT_JOB_SENT",
                LocalDateTime.now(),
                "Da gui lenh in bien lai"
        );
    }

    // Chức năng: xử lý xuất hóa đơn điện tử sang tệp PDF (bytes).
    public byte[] exportInvoicePdf(Long invoiceId) {
        Invoice invoice = getPaidInvoiceOrThrow(invoiceId);
        CashierPaymentRecordDetailResponse detail = toPaymentRecordDetailResponse(invoice);
        List<String> lines = buildReceiptLines(invoice, detail);

        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float marginLeft = 48f;
                float y = page.getMediaBox().getHeight() - 52f;

                content.setLeading(16f);
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 14);
                content.newLineAtOffset(marginLeft, y);
                content.showText(CLINIC_LOGO_TEXT + " " + CLINIC_NAME);
                content.newLine();
                content.setFont(PDType1Font.HELVETICA, 11);
                for (String line : lines) {
                    content.showText(line);
                    content.newLine();
                }
                content.endText();
            }

            document.save(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Khong the tao file PDF", ex);
        }
    }

    // Chức năng: xử lý tổng số dịch vụ.
    private BigDecimal serviceLineTotal(MedicalRecordServiceDetail detail) {
        BigDecimal price = detail.getActualPrice() == null ? BigDecimal.ZERO : detail.getActualPrice();
        BigDecimal quantity = BigDecimal.ZERO;
        if (detail.getQuantity() != null) {
            quantity = BigDecimal.valueOf(detail.getQuantity().longValue());
        }
        return price.multiply(quantity);
    }

    // Chức năng: xử lý tổng số thuốc.
    private BigDecimal medicineLineTotal(PrescriptionDetail detail) {
        BigDecimal price = BigDecimal.ZERO;
        if (detail.getMedicine() != null && detail.getMedicine().getSellingPrice() != null) {
            price = detail.getMedicine().getSellingPrice();
        }
        BigDecimal quantity = BigDecimal.ZERO;
        if (detail.getQuantity() != null) {
            quantity = BigDecimal.valueOf(detail.getQuantity().longValue());
        }
        return price.multiply(quantity);
    }

    // Chức năng: xử lý ánh xạ tới phản hồi mục thanh toán đang chờ xử lý.
    private CashierWaitingPaymentItemResponse toWaitingPaymentItemResponse(Invoice invoice) {
        MedicalRecord medicalRecord = invoice.getMedicalRecord();
        Appointment appointment = medicalRecord == null ? null : medicalRecord.getAppointment();
        Patient patient = appointment == null ? null : appointment.getPatient();

        return new CashierWaitingPaymentItemResponse(
                invoice.getId(),
                medicalRecord == null ? null : medicalRecord.getId(),
                patient == null ? null : patient.getId(),
                patient == null ? null : patient.getFullName(),
                patient == null ? null : patient.getPhoneNumber(),
                appointment == null ? null : appointment.getAppointmentTime(),
                invoice.getTotalAmount(),
                Boolean.TRUE.equals(invoice.getIsPaid()) ? STATUS_PAID : STATUS_WAITING_PAYMENT
        );
    }

    // Chức năng: xử lý ánh xạ tới phản hồi chi tiết hồ sơ thanh toán.
    private CashierPaymentRecordDetailResponse toPaymentRecordDetailResponse(Invoice invoice) {
        MedicalRecord medicalRecord = invoice.getMedicalRecord();
        Appointment appointment = medicalRecord == null ? null : medicalRecord.getAppointment();
        Patient patient = appointment == null ? null : appointment.getPatient();
        Long medicalRecordId = medicalRecord == null ? null : medicalRecord.getId();

        List<CashierServiceLineItemResponse> services = medicalRecordId == null
                ? List.of()
                : medicalRecordServiceDetailRepository.findByMedicalRecord_Id(medicalRecordId).stream()
                        .map(detail -> {
                            BigDecimal unitPrice = detail.getActualPrice() == null ? BigDecimal.ZERO : detail.getActualPrice();
                            BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());
                            return new CashierServiceLineItemResponse(
                                    detail.getService() == null ? null : detail.getService().getId(),
                                    detail.getService() == null ? null : detail.getService().getServiceName(),
                                    detail.getQuantity(),
                                    unitPrice,
                                    unitPrice.multiply(quantity)
                            );
                        })
                        .toList();

        List<CashierMedicineLineItemResponse> medicines = medicalRecordId == null
                ? List.of()
                : prescriptionDetailRepository.findByMedicalRecord_Id(medicalRecordId).stream()
                        .map(detail -> {
                            BigDecimal unitPrice = (detail.getMedicine() != null && detail.getMedicine().getSellingPrice() != null)
                                    ? detail.getMedicine().getSellingPrice()
                                    : BigDecimal.ZERO;
                            BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());
                            return new CashierMedicineLineItemResponse(
                                    detail.getMedicine() == null ? null : detail.getMedicine().getId(),
                                    detail.getMedicine() == null ? null : detail.getMedicine().getMedicineName(),
                                    detail.getQuantity(),
                                    detail.getUsageInstructions(),
                                    unitPrice,
                                    unitPrice.multiply(quantity)
                            );
                        })
                        .toList();

        return new CashierPaymentRecordDetailResponse(
                invoice.getId(),
                medicalRecordId,
                patient == null ? null : patient.getId(),
                patient == null ? null : patient.getFullName(),
                patient == null ? null : patient.getPhoneNumber(),
                appointment == null ? null : appointment.getAppointmentTime(),
                Boolean.TRUE.equals(invoice.getIsPaid()) ? STATUS_PAID : STATUS_WAITING_PAYMENT,
                invoice.getPaymentMethod(),
                invoice.getPaidAt(),
                invoice.getTotalServiceFee(),
                invoice.getTotalMedicineFee(),
                invoice.getTotalAmount(),
                services,
                medicines
        );
    }

    // Chức năng: xử lý Ánh xạ hóa đơn với mục lịch sử giao dịch.
    private CashierTransactionHistoryItemResponse toTransactionHistoryItem(Invoice invoice) {
        MedicalRecord medicalRecord = invoice.getMedicalRecord();
        Appointment appointment = medicalRecord == null ? null : medicalRecord.getAppointment();
        Patient patient = appointment == null ? null : appointment.getPatient();

        return new CashierTransactionHistoryItemResponse(
                invoice.getId(),
                medicalRecord == null ? null : medicalRecord.getId(),
                patient == null ? null : patient.getId(),
                patient == null ? null : patient.getFullName(),
                invoice.getPaymentMethod(),
                invoice.getPaidAt(),
                invoice.getTotalAmount()
        );
    }

    // Chức năng: xử lý chuẩn hóa keyword.
    private String normalizeKeyword(String keyword) {
        return keyword.trim().toLowerCase(Locale.ROOT);
    }

    // Chức năng: xử lý so sánh từ khóa cho mã số hóa đơn/bệnh nhân.
    private boolean matchesKeyword(Invoice invoice, String keyword) {
        MedicalRecord medicalRecord = invoice.getMedicalRecord();
        Appointment appointment = medicalRecord == null ? null : medicalRecord.getAppointment();
        Patient patient = appointment == null ? null : appointment.getPatient();

        return containsNumber(invoice.getId(), keyword)
                || containsNumber(medicalRecord == null ? null : medicalRecord.getId(), keyword)
                || containsNumber(patient == null ? null : patient.getId(), keyword)
                || containsText(patient == null ? null : patient.getPhoneNumber(), keyword)
                || containsText(patient == null ? null : patient.getNationalId(), keyword)
                || containsText(patient == null ? null : patient.getHealthInsuranceNumber(), keyword);
    }

    // Chức năng: xử lý nội dung chứa giá trị số.
    private boolean containsNumber(Long value, String keyword) {
        return value != null && String.valueOf(value).contains(keyword);
    }

    // Chức năng: xử lý nội dung chứa giá trị văn bản.
    private boolean containsText(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    // Chức năng: xử lý kiểm tra bệnh nhân có BHYT hay không.
    private boolean hasHealthInsurance(Patient patient) {
        return patient != null
                && patient.getHealthInsuranceNumber() != null
                && !patient.getHealthInsuranceNumber().trim().isEmpty();
    }

    // Chức năng: xử lý tính mức giảm trừ BHYT 70%.
    private BigDecimal calculateHealthInsuranceDiscount(BigDecimal grossAmount) {
        return defaultAmount(grossAmount)
                .multiply(HEALTH_INSURANCE_DISCOUNT_RATE)
                .setScale(0, RoundingMode.HALF_UP);
    }

    // Chức năng: xử lý giá trị số tiền mặc định.
    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    // Chức năng: xử lý chuẩn hóa đầu vào phương thức thanh toán.
    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paymentMethod is required");
        }
        return paymentMethod.trim().toUpperCase(Locale.ROOT);
    }

    // Chức năng: xử lý xác nhận trạng thái thanh toán điện tử.
    private void ensureElectronicPaymentSucceeded(String paymentMethod, Boolean paymentSuccessful) {
        boolean isElectronic = "CHUYEN_KHOAN".equals(paymentMethod) || "POS".equals(paymentMethod);
        if (isElectronic && !Boolean.TRUE.equals(paymentSuccessful)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Giao dich chua thanh cong");
        }
    }

    // Chức năng: xử lý Trừ đi lượng thuốc tồn kho khi xác nhận thanh toán.
    private void deductMedicineStockOnPayment(Long medicalRecordId) {
        List<PrescriptionDetail> prescriptionDetails = prescriptionDetailRepository.findByMedicalRecord_Id(medicalRecordId);

        for (PrescriptionDetail detail : prescriptionDetails) {
            Medicine medicine = detail.getMedicine();
            if (medicine == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Khong tim thay thong tin thuoc trong don");
            }

            int quantity = Objects.requireNonNullElse(detail.getQuantity(), 0);
            if (quantity <= 0) {
                continue;
            }

            int currentStock = Objects.requireNonNullElse(medicine.getStockQuantity(), 0);
            if (currentStock < quantity) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Khong du ton kho de thanh toan thuoc: " + medicine.getMedicineName()
                );
            }

            medicine.setStockQuantity(currentStock - quantity);
            medicineRepository.save(medicine);
        }
    }

    // Chức năng: xử lý Đánh dấu hóa đơn đã thanh toán bằng tiền mặt và kết thúc phiên thanh toán của bệnh nhân.
    private Invoice markInvoiceAsPaidAndCloseSession(Invoice invoice) {
        return markInvoiceAsPaidAndCloseSession(invoice, "TIEN_MAT");
    }

    // Chức năng: xử lý Đánh dấu hóa đơn đã thanh toán và kết thúc phiên thanh toán của bệnh nhân.
    private Invoice markInvoiceAsPaidAndCloseSession(Invoice invoice, String paymentMethod) {
        LocalDateTime paidAt = LocalDateTime.now();
        invoice.setIsPaid(true);
        invoice.setPaidAt(paidAt);
        invoice.setPaymentMethod(paymentMethod);

        MedicalRecord medicalRecord = invoice.getMedicalRecord();
        if (medicalRecord != null) {
            Appointment appointment = medicalRecord.getAppointment();
            if (appointment != null && !"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
                appointment.setStatus("COMPLETED");
            }
        }

        return invoiceRepository.save(invoice);
    }

    // Chức năng: xử lý chuẩn hóa bộ lọc phương thức thanh toán tùy chọn.
    private String normalizePaymentMethodFilter(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return null;
        }
        String normalized = paymentMethod.trim().toUpperCase(Locale.ROOT);
        if ("ALL".equals(normalized)) {
            return null;
        }
        if (!SUPPORTED_PAYMENT_METHODS.contains(normalized)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phuong thuc thanh toan khong hop le. Ho tro: TIEN_MAT, CHUYEN_KHOAN, POS"
            );
        }
        return normalized;
    }

    // Chức năng: xử lý Tổng số tiền theo phương thức thanh toán.
    private BigDecimal sumAmountByPaymentMethod(List<Invoice> invoices, String paymentMethod) {
        return invoices.stream()
                .filter(invoice -> paymentMethod.equalsIgnoreCase(nullSafe(invoice.getPaymentMethod())))
                .map(Invoice::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Chức năng: xử lý Xây dựng mã hóa đơn cho quy trình xuất báo cáo.
    private String buildInvoiceCode(Long invoiceId, LocalDateTime paidAt) {
        return "INV-" + paidAt.getYear() + "-" + invoiceId;
    }

    // Chức năng: xử lý Đảm bảo hóa đơn đã được xác nhận thanh toán trước khi in/xuất.
    private Invoice getPaidInvoiceOrThrow(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (!Boolean.TRUE.equals(invoice.getIsPaid())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hoa don chua duoc xac nhan thanh toan");
        }
        return invoice;
    }

    // Chức năng: xử lý tạo văn bản biên lai được định dạng.
    private String buildReceiptText(Invoice invoice, CashierPaymentRecordDetailResponse detail) {
        return String.join(System.lineSeparator(), buildReceiptLines(invoice, detail));
    }

    // Chức năng: xử lý xây dựng các dòng biên lai cho đầu ra in/PDF.
    private List<String> buildReceiptLines(Invoice invoice, CashierPaymentRecordDetailResponse detail) {
        List<String> lines = new ArrayList<>();
        lines.add("================ BIEN LAI THU TIEN ================");
        lines.add("Ma hoa don: " + invoice.getId());
        lines.add("Ma ho so: " + detail.getMedicalRecordId());
        lines.add("Benh nhan: " + nullSafe(detail.getPatientName()));
        lines.add("So dien thoai: " + nullSafe(detail.getPhoneNumber()));
        lines.add("Ngay gio thanh toan: " + formatDateTime(invoice.getPaidAt()));
        lines.add("----------------------------------------------------");
        lines.add("Chi tiet dich vu:");
        if (detail.getServices() == null || detail.getServices().isEmpty()) {
            lines.add("  - Khong co");
        } else {
            for (CashierServiceLineItemResponse service : detail.getServices()) {
                lines.add("  - " + nullSafe(service.getServiceName())
                        + " | SL: " + valueOrZero(service.getQuantity())
                        + " | Don gia: " + formatAmount(service.getUnitPrice())
                        + " | Thanh tien: " + formatAmount(service.getLineTotal()));
            }
        }

        lines.add("----------------------------------------------------");
        lines.add("Chi tiet thuoc:");
        if (detail.getMedicines() == null || detail.getMedicines().isEmpty()) {
            lines.add("  - Khong co");
        } else {
            for (CashierMedicineLineItemResponse medicine : detail.getMedicines()) {
                lines.add("  - " + nullSafe(medicine.getMedicineName())
                        + " | SL: " + valueOrZero(medicine.getQuantity())
                        + " | Don gia: " + formatAmount(medicine.getUnitPrice())
                        + " | Thanh tien: " + formatAmount(medicine.getLineTotal()));
            }
        }

        lines.add("----------------------------------------------------");
        lines.add("Tong tien dich vu: " + formatAmount(detail.getTotalServiceFee()));
        lines.add("Tong tien thuoc: " + formatAmount(detail.getTotalMedicineFee()));
        lines.add("TONG THANH TOAN: " + formatAmount(detail.getTotalAmount()));
        lines.add("====================================================");
        lines.add("Cam on quy khach da su dung dich vu!");
        return lines;
    }

    // Chức năng: xử lý kết nối máy in.
    private PrintService resolvePrinter(String printerName) {
        PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);
        if (services == null || services.length == 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Khong tim thay may in duoc ket noi");
        }

        if (printerName == null || printerName.isBlank()) {
            PrintService defaultPrinter = PrintServiceLookup.lookupDefaultPrintService();
            if (defaultPrinter != null) {
                return defaultPrinter;
            }
            return services[0];
        }

        String normalized = printerName.trim().toLowerCase(Locale.ROOT);
        for (PrintService service : services) {
            if (service.getName() != null && service.getName().toLowerCase(Locale.ROOT).contains(normalized)) {
                return service;
            }
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay may in: " + printerName);
    }

    // Chức năng: xử lý văn bản không an toàn.
    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    // Chức năng: xử lý định dạng thời gian.
    private String formatDateTime(LocalDateTime value) {
        if (value == null) {
            return "";
        }
        return value.format(RECEIPT_TIME_FORMAT);
    }

    // Chức năng: xử lý định dạng số tiền.
    private String formatAmount(BigDecimal amount) {
        BigDecimal safeAmount = amount == null ? BigDecimal.ZERO : amount;
        return safeAmount.toPlainString() + " VND";
    }

    // Chức năng: xử lý giá trị mặc định.
    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }
}

