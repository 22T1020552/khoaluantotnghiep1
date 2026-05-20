import { PatientInfo } from "./patient-info";
import { MedicalRecordForm } from "./medical-record-form";
import { PrescriptionSection } from "./prescription-section";
import { DoctorMedicalService, type DiagnosisTemplateResponse } from "@/services/doctorService";
import type { Appointment, MedicalRecordInput, Medicine, PrescriptionItem, SelectedServiceItem } from "@/types/doctor.type";
import styles from "@/styles/common.module.css";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
};

interface ExaminationModalProps {
  appointment: Appointment;
  saving: boolean;
  diagnosisLoading: boolean;
  diagnosisOptions: DiagnosisTemplateResponse[];
  selectedDiagnosisId: number | null;
  medicalRecord: MedicalRecordInput;
  prescriptions: PrescriptionItem[];
  availableMedicines: Medicine[];
  availableServices: DoctorMedicalService[];
  selectedServices: SelectedServiceItem[];
  historyRows: any[];
  historyDetail: any;
  historyLoading: boolean;
  historyDetailLoading: boolean;
  totalServiceCost: number;
  onClose: () => void;
  onComplete: () => void;
  onMedicalRecordChange: (field: string, value: string) => void;
  onDiagnosisSelect: (diagnosisId: number) => void;
  onAddMedicine: (medicine: Medicine) => void;
  onUpdatePrescription: (id: number, field: "quantity" | "usage_instructions", value: any) => void;
  onRemoveMedicine: (id: number) => void;
  onAddService: (service: DoctorMedicalService) => void;
  onUpdateService: (id: number, field: "quantity" | "actual_price" | "result_note", value: any) => void;
  onRemoveService: (id: number) => void;
  onViewHistoryDetail: (historyId: number) => void;
}

export function ExaminationModal(props: ExaminationModalProps) {
  const { appointment } = props;

  return (
    <div className={styles.modal} onClick={props.onClose}>
      <div className={`${styles.modalContent} ${styles.modalContentWide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Khám bệnh - {appointment.patient.full_name}</h2>
        </div>

        <div className={styles.sectionBlock}>
          
          {/* 1. COMPONENT THÔNG TIN BỆNH NHÂN CỦA BẠN */}
          <PatientInfo 
            patient={appointment.patient} 
            symptoms={appointment.symptoms} 
            categoryName={appointment.category?.name ?? null}
          />

          {/* 2. COMPONENT ĐIỀN BỆNH ÁN CỦA BẠN */}
          <MedicalRecordForm 
            medicalRecord={props.medicalRecord}
            diagnosisLoading={props.diagnosisLoading}
            diagnosisOptions={props.diagnosisOptions}
            selectedDiagnosisId={props.selectedDiagnosisId}
            historyRows={props.historyRows}
            historyDetail={props.historyDetail}
            historyLoading={props.historyLoading}
            historyDetailLoading={props.historyDetailLoading}
            onDiagnosisSelect={props.onDiagnosisSelect}
            onChange={props.onMedicalRecordChange}
            onViewHistory={props.onViewHistoryDetail}
          />

          {/* LỊCH SỬ KHÁM CŨ */}
          <div>

            {props.historyDetailLoading && <p className={styles.textSmall}>Đang tải chi tiết hồ sơ...</p>}
            {props.historyDetail && (
              <div className={`${styles.panelMuted} ${styles.mb2}`}>
                <p className={styles.textSmall}><strong>Chẩn đoán:</strong> {props.historyDetail.diagnosis || "-"}</p>
                <p className={styles.textSmall}><strong>Lời dặn:</strong> {props.historyDetail.doctorAdvice || "-"}</p>
                <div className={styles.mb2}>
                  <p className={styles.textSmall}><strong>Thuốc đã kê:</strong></p>
                  {props.historyDetail.prescriptions.length > 0 ? (
                    <div className={styles.rowStack}>
                      {props.historyDetail.prescriptions.map((item: any) => (
                        <div key={item.medicineId} className={styles.itemCard}>
                          <p className={styles.textSmall}>{item.medicineName} - SL: {item.quantity}</p>
                          <p className={styles.textSmall}>{item.usageInstructions || "-"}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className={styles.textSmall}>Không có thuốc.</p>}
                </div>
              </div>
            )}
          </div>

          {/* DỊCH VỤ BỔ SUNG */}
          <div className={styles.panelBorder}>
            <div className={`${styles.flexBetween} ${styles.mb2}`}>
              <h4 className={styles.titleSmall}>Dịch vụ bổ sung trong phòng khám</h4>
            </div>

            {props.selectedServices.length > 0 ? (
              <div className={styles.rowStack}>
                {props.selectedServices.map((item) => (
                  <div key={item.service_id} className={styles.itemCard}>
                    <p className={styles.textSmall}>{item.service_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.textSmall}>Bệnh nhân chưa chọn dịch vụ bổ sung khi đặt lịch.</p>
            )}
          </div>

          {/* 3. COMPONENT ĐƠN THUỐC CỦA BẠN */}
          <PrescriptionSection 
            prescriptions={props.prescriptions}
            availableMedicines={props.availableMedicines}
            onAddMedicine={props.onAddMedicine}
            onUpdatePrescription={props.onUpdatePrescription}
            onRemoveMedicine={props.onRemoveMedicine}
          />

          {/* TỔNG CHI PHÍ */}
          <div className={styles.summaryCard}>
            <p className={styles.textSmall}>Dịch vụ đã được thu ngân thanh toán trước.</p>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button className={`${styles.button} ${styles.primary} ${styles.actionButtonGrow}`} onClick={props.onComplete} disabled={props.saving}>
            Hoàn thành khám
          </button>
          <button className={`${styles.button} ${styles.outline} ${styles.actionButtonGrow}`} onClick={props.onClose} disabled={props.saving}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}