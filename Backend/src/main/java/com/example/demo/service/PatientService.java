package com.example.demo.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.PatientMedicalRecordDetailResponse;
import com.example.demo.dto.PatientMedicalRecordHistoryItemResponse;
import com.example.demo.dto.PatientPrescriptionHistoryItemResponse;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.MedicalRecord;
import com.example.demo.entity.Patient;
import com.example.demo.entity.PrescriptionDetail;
import com.example.demo.entity.User;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.PrescriptionDetailRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final InvoiceRepository invoiceRepository;

    //  LẤY PATIENT TỪ USERNAME (CỰC QUAN TRỌNG)
    // Chức năng: xử lý get patient from username.
    public Patient getPatientFromUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân"));
    }

        // Chức năng: xử lý lấy lịch sử bệnh án của bệnh nhân đăng nhập.
        public List<PatientMedicalRecordHistoryItemResponse> getMyMedicalRecordHistory(String username) {
        Patient patient = getPatientFromUsername(username);

        return medicalRecordRepository.findByAppointment_Patient_Id(patient.getId()).stream()
            .sorted(Comparator.comparing(MedicalRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toHistoryItemResponse)
            .toList();
        }

        // Chức năng: xử lý lấy chi tiết bệnh án và đơn thuốc của bệnh nhân đăng nhập.
        public PatientMedicalRecordDetailResponse getMyMedicalRecordDetail(String username, Long medicalRecordId) {
        Patient patient = getPatientFromUsername(username);

        MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh án"));

        Appointment appointment = medicalRecord.getAppointment();
        if (appointment == null || appointment.getPatient() == null
            || !patient.getId().equals(appointment.getPatient().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập bệnh án này");
        }

        List<PatientPrescriptionHistoryItemResponse> prescriptionItems = prescriptionDetailRepository
            .findByMedicalRecord_Id(medicalRecordId)
            .stream()
            .map(this::toPrescriptionItemResponse)
            .toList();

        Invoice invoice = invoiceRepository.findByMedicalRecord_Id(medicalRecordId).orElse(null);

        return new PatientMedicalRecordDetailResponse(
            medicalRecord.getId(),
            appointment.getId(),
            appointment.getAppointmentTime(),
            appointment.getStatus(),
            appointment.getDoctor() == null ? null : appointment.getDoctor().getUsername(),
            medicalRecord.getDiagnosis(),
            medicalRecord.getDoctorAdvice(),
            medicalRecord.getCreatedAt(),
            invoice == null ? null : invoice.getId(),
            invoice == null ? BigDecimal.ZERO : invoice.getTotalServiceFee(),
            invoice == null ? BigDecimal.ZERO : invoice.getTotalMedicineFee(),
            invoice == null ? BigDecimal.ZERO : invoice.getTotalAmount(),
            invoice != null && Boolean.TRUE.equals(invoice.getIsPaid()),
            invoice == null ? null : invoice.getPaidAt(),
            invoice == null ? null : invoice.getPaymentMethod(),
            prescriptionItems
        );
        }

        // Chức năng: xử lý ánh xạ bệnh án sang DTO lịch sử.
        private PatientMedicalRecordHistoryItemResponse toHistoryItemResponse(MedicalRecord medicalRecord) {
        Appointment appointment = medicalRecord.getAppointment();
        int prescriptionItemCount = prescriptionDetailRepository.findByMedicalRecord_Id(medicalRecord.getId()).size();
        Invoice invoice = invoiceRepository.findByMedicalRecord_Id(medicalRecord.getId()).orElse(null);

        return new PatientMedicalRecordHistoryItemResponse(
            medicalRecord.getId(),
            appointment == null ? null : appointment.getId(),
            appointment == null ? null : appointment.getAppointmentTime(),
            appointment == null ? null : appointment.getStatus(),
            (appointment == null || appointment.getDoctor() == null) ? null : appointment.getDoctor().getUsername(),
            medicalRecord.getDiagnosis(),
            medicalRecord.getDoctorAdvice(),
            medicalRecord.getCreatedAt(),
            prescriptionItemCount,
            invoice == null ? null : invoice.getId(),
            invoice == null ? BigDecimal.ZERO : invoice.getTotalServiceFee(),
            invoice == null ? BigDecimal.ZERO : invoice.getTotalMedicineFee(),
            invoice == null ? BigDecimal.ZERO : invoice.getTotalAmount(),
            invoice != null && Boolean.TRUE.equals(invoice.getIsPaid()),
            invoice == null ? null : invoice.getPaidAt(),
            invoice == null ? null : invoice.getPaymentMethod()
        );
        }

        // Chức năng: xử lý ánh xạ chi tiết đơn thuốc sang DTO lịch sử.
        private PatientPrescriptionHistoryItemResponse toPrescriptionItemResponse(PrescriptionDetail detail) {
        BigDecimal unitPrice = (detail.getMedicine() != null && detail.getMedicine().getSellingPrice() != null)
            ? detail.getMedicine().getSellingPrice()
            : BigDecimal.ZERO;
            Integer quantityValue = detail.getQuantity();
            int normalizedQuantity = quantityValue == null ? 0 : quantityValue;
            BigDecimal quantity = BigDecimal.valueOf(normalizedQuantity);

        return new PatientPrescriptionHistoryItemResponse(
            detail.getMedicine() == null ? null : detail.getMedicine().getId(),
            detail.getMedicine() == null ? null : detail.getMedicine().getMedicineName(),
            detail.getMedicine() == null ? null : detail.getMedicine().getUnit(),
                quantityValue,
            detail.getUsageInstructions(),
            unitPrice,
            unitPrice.multiply(quantity)
        );
        }
}

