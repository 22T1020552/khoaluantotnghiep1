package com.example.demo.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AddPrescriptionDetailRequest;
import com.example.demo.dto.CreateMedicalRecordRequest;
import com.example.demo.dto.PrescriptionAutosaveResponse;
import com.example.demo.dto.PrescriptionMedicineCatalogResponse;
import com.example.demo.dto.PrescriptionWorkspaceResponse;
import com.example.demo.dto.QuickAddPrescriptionMedicineRequest;
import com.example.demo.dto.UpdatePrescriptionDetailRequest;
import com.example.demo.dto.UpsertMedicalRecordServiceResultRequest;
import com.example.demo.entity.MedicalRecord;
import com.example.demo.entity.MedicalRecordServiceDetail;
import com.example.demo.entity.PrescriptionDetail;
import com.example.demo.service.MedicalRecordService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Tag(
    name = "MedicalRecord",
    description = "Nghiep vu benh an: tao benh an, don thuoc, ket qua dich vu can lam sang va hoan tat ho so kham."
)
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping
    @Operation(summary = "Danh sach benh an")
    public List<MedicalRecord> getAll() {
        return medicalRecordService.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiet benh an")
    public MedicalRecord getById(@PathVariable Long id) {
        return medicalRecordService.getById(id);
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Lay benh an theo lich hen")
    public MedicalRecord getByAppointment(@PathVariable Long appointmentId) {
        return medicalRecordService.getByAppointmentId(appointmentId);
    }

    @PostMapping
    @Operation(summary = "Tao benh an")
    public MedicalRecord create(@RequestParam Long appointmentId, @RequestBody MedicalRecord request) {
        return medicalRecordService.create(appointmentId, request);
    }

    @PostMapping("/doctor")
    @Operation(summary = "Bac si tao benh an")
    public MedicalRecord createByDoctor(
            Authentication authentication,
            @Valid @RequestBody CreateMedicalRecordRequest request) {
        return medicalRecordService.createByDoctor(authentication.getName(), request);
    }

    @PostMapping("/{medicalRecordId}/prescription-details")
    @Operation(summary = "Them thuoc vao don")
    public PrescriptionDetail addPrescriptionDetail(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @Valid @RequestBody AddPrescriptionDetailRequest request) {
        return medicalRecordService.addMedicineToCurrentMedicalRecord(
                authentication.getName(),
                medicalRecordId,
                request
        );
    }

    @GetMapping("/{medicalRecordId}/prescription-details")
    @Operation(summary = "Danh sach thuoc trong don")
    public List<PrescriptionDetail> getPrescriptionDetails(
            Authentication authentication,
            @PathVariable Long medicalRecordId) {
        return medicalRecordService.getPrescriptionDetailsByMedicalRecord(
                authentication.getName(),
                medicalRecordId
        );
    }

    @PostMapping("/{medicalRecordId}/service-results")
    @Operation(summary = "Cap nhat ket qua dich vu")
    public MedicalRecordServiceDetail upsertServiceResult(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @Valid @RequestBody UpsertMedicalRecordServiceResultRequest request) {
        return medicalRecordService.upsertMedicalRecordServiceResult(
                authentication.getName(),
                medicalRecordId,
                request
        );
    }

    @GetMapping("/{medicalRecordId}/prescription-workspace")
    @Operation(summary = "Khong gian ke don")
    // Chức năng: xử lý get prescription workspace.
    public PrescriptionWorkspaceResponse getPrescriptionWorkspace(
            Authentication authentication,
            @PathVariable Long medicalRecordId) {
        return medicalRecordService.getPrescriptionWorkspace(authentication.getName(), medicalRecordId);
    }

    @GetMapping("/{medicalRecordId}/medicine-catalog")
    @Operation(summary = "Danh muc thuoc de ke don")
    public PrescriptionMedicineCatalogResponse getMedicineCatalogByGroup(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @RequestParam(required = false) String group) {
        return medicalRecordService.getMedicineCatalogForPrescription(
                authentication.getName(),
                medicalRecordId,
                group
        );
    }

    @PostMapping("/{medicalRecordId}/prescription-details/quick-add")
    @Operation(summary = "Them nhanh thuoc vao don")
    public PrescriptionWorkspaceResponse quickAddMedicineToPrescription(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @Valid @RequestBody QuickAddPrescriptionMedicineRequest request) {
        return medicalRecordService.quickAddMedicineToPrescription(
                authentication.getName(),
                medicalRecordId,
                request.getMedicineId()
        );
    }

    @PutMapping("/{medicalRecordId}/prescription-details/{medicineId}")
    @Operation(summary = "Cap nhat chi tiet thuoc")
    public PrescriptionDetail updatePrescriptionDetail(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @PathVariable Long medicineId,
            @Valid @RequestBody UpdatePrescriptionDetailRequest request) {
        return medicalRecordService.updatePrescriptionDetail(
                authentication.getName(),
                medicalRecordId,
                medicineId,
                request
        );
    }

    @PutMapping("/{medicalRecordId}/prescription-details/{medicineId}/autosave")
    @Operation(summary = "Tu dong luu don thuoc")
    public PrescriptionAutosaveResponse autosavePrescriptionDetail(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @PathVariable Long medicineId,
            @Valid @RequestBody UpdatePrescriptionDetailRequest request) {
        return medicalRecordService.autosavePrescriptionDetail(
                authentication.getName(),
                medicalRecordId,
                medicineId,
                request
        );
    }

    @DeleteMapping("/{medicalRecordId}/prescription-details/{medicineId}")
    @Operation(summary = "Xoa thuoc khoi don")
    public PrescriptionWorkspaceResponse removePrescriptionDetail(
            Authentication authentication,
            @PathVariable Long medicalRecordId,
            @PathVariable Long medicineId) {
        return medicalRecordService.removePrescriptionDetail(
                authentication.getName(),
                medicalRecordId,
                medicineId
        );
    }

    @PostMapping("/{medicalRecordId}/prescription-save")
    @Operation(summary = "Luu don thuoc")
    public PrescriptionWorkspaceResponse savePrescription(
            Authentication authentication,
            @PathVariable Long medicalRecordId) {
        return medicalRecordService.savePrescription(authentication.getName(), medicalRecordId);
    }

    @PutMapping("/{medicalRecordId}/complete")
    @Operation(summary = "Hoan tat benh an")
    public MedicalRecord completeMedicalRecord(
            Authentication authentication,
            @PathVariable Long medicalRecordId) {
        return medicalRecordService.completeMedicalRecord(authentication.getName(), medicalRecordId);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cap nhat benh an")
    public MedicalRecord update(@PathVariable Long id, @RequestBody MedicalRecord request) {
        return medicalRecordService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoa benh an")
    public void delete(@PathVariable Long id) {
        medicalRecordService.delete(id);
    }
}

