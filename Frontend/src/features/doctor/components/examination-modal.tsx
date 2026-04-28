import { PatientInfo } from "./patient-info";
import { MedicalRecordForm } from "./medical-record-form";
import { PrescriptionSection } from "./prescription-section";
import { DoctorMedicalService } from "@/services/doctorService";
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
  medicalRecord: MedicalRecordInput;
  prescriptions: PrescriptionItem[];
  availableMedicines: Medicine[];
  availableServices: DoctorMedicalService[];
  selectedServices: SelectedServiceItem[];
  historyRows: any[];
  historyDetail: any;
  historyLoading: boolean;
  historyDetailLoading: boolean;
  totalMedicineCost: number;
  totalServiceCost: number;
  grandTotalCost: number;
  onClose: () => void;
  onComplete: () => void;
  onMedicalRecordChange: (field: string, value: string) => void;
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
          />

          {/* 2. COMPONENT ĐIỀN BỆNH ÁN CỦA BẠN */}
          <MedicalRecordForm 
            medicalRecord={props.medicalRecord}
            historyRows={props.historyRows}
            historyDetail={props.historyDetail}
            historyLoading={props.historyLoading}
            historyDetailLoading={props.historyDetailLoading}
            onChange={props.onMedicalRecordChange}
            onViewHistory={props.onViewHistoryDetail}
          />

          {/* LỊCH SỬ KHÁM CŨ */}
          <div className={styles.panelBorder}>
            <div className={`${styles.flexBetween} ${styles.mb2}`}>
              <h4 className={styles.titleSmall}>Hồ sơ bệnh án cũ của bệnh nhân</h4>
              <span className={styles.textSmall}>Đối chiếu tiền sử khám</span>
            </div>

            {props.historyLoading && <p className={styles.textSmall}>Đang tải lịch sử bệnh án...</p>}
            {!props.historyLoading && props.historyRows.length === 0 && <p className={styles.textSmall}>Bệnh nhân chưa có hồ sơ khám cũ tại phòng khám.</p>}

            {!props.historyLoading && props.historyRows.length > 0 && (
              <div className={styles.rowStack}>
                {props.historyRows.map((row) => (
                  <div key={row.medicalRecordId} className={styles.itemCard}>
                    <div className={styles.flexBetween}>
                      <div>
                        <p className={styles.textSmall}><strong>Ngày khám:</strong> {formatDate(row.appointmentTime)}</p>
                        <p className={styles.textSmall}><strong>Chẩn đoán cũ:</strong> {row.oldDiagnosis || "-"}</p>
                      </div>
                      <button type="button" className={`${styles.button} ${styles.outline}`} onClick={() => props.onViewHistoryDetail(row.medicalRecordId)}>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
              <span className={styles.textSmall}>Tổng dịch vụ: {props.totalServiceCost.toLocaleString("vi-VN")}đ</span>
            </div>

            {props.selectedServices.length > 0 && (
              <div className={`${styles.rowStack} ${styles.mb2}`}>
                {props.selectedServices.map((item) => (
                  <div key={item.service_id} className={styles.itemCard}>
                    <div className={`${styles.flexBetween} ${styles.mb1}`}>
                      <span className={styles.titleSmall}>{item.service_name}</span>
                      <span>{(item.actual_price * item.quantity).toLocaleString("vi-VN")}đ</span>
                    </div>

                    <div className={`${styles.grid2} ${styles.mb1}`}>
                      <div>
                        <label className={`${styles.textSmall} ${styles.textMuted}`}>Số lượng</label>
                        <input type="number" className={`${styles.input} ${styles.compactInput}`} min="1" value={item.quantity} onChange={(e) => props.onUpdateService(item.service_id, "quantity", parseInt(e.target.value, 10) || 1)} />
                      </div>
                      <div>
                        <label className={`${styles.textSmall} ${styles.textMuted}`}>Đơn giá thực tế (VNĐ)</label>
                        <input type="number" className={`${styles.input} ${styles.compactInput}`} min="1" value={item.actual_price} onChange={(e) => props.onUpdateService(item.service_id, "actual_price", parseInt(e.target.value, 10) || 0)} />
                      </div>
                    </div>

                    <div>
                      <label className={`${styles.textSmall} ${styles.textMuted}`}>Ghi chú dịch vụ</label>
                      <input className={`${styles.input} ${styles.compactInput}`} placeholder="VD: Chuyển phòng X-quang" value={item.result_note || ""} onChange={(e) => props.onUpdateService(item.service_id, "result_note", e.target.value)} />
                    </div>

                    <button className={`${styles.button} ${styles.outline} ${styles.fullButton} ${styles.textDanger}`} onClick={() => props.onRemoveService(item.service_id)}>
                      Xóa dịch vụ
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.serviceGrid}>
              {props.availableServices.map((service) => (
                <button key={service.id} type="button" className={styles.serviceItem} onClick={() => props.onAddService(service)}>
                  <p className={`${styles.textMedium} ${styles.textSmall}`}>{service.serviceName}</p>
                  <p className={`${styles.textSmall} ${styles.textMuted}`}>{Number(service.currentPrice || 0).toLocaleString("vi-VN")}đ</p>
                </button>
              ))}
            </div>
            {props.availableServices.length === 0 && <p className={styles.textSmall}>Chưa có dịch vụ active trong hệ thống.</p>}
          </div>

          {/* 3. COMPONENT ĐƠN THUỐC CỦA BẠN */}
          <PrescriptionSection 
            prescriptions={props.prescriptions}
            availableMedicines={props.availableMedicines}
            totalCost={props.totalMedicineCost}
            onAddMedicine={props.onAddMedicine}
            onUpdatePrescription={props.onUpdatePrescription}
            onRemoveMedicine={props.onRemoveMedicine}
          />

          {/* TỔNG CHI PHÍ */}
          <div className={styles.summaryCard}>
            <p className={styles.textSmall}>Tiền thuốc: {props.totalMedicineCost.toLocaleString("vi-VN")}đ</p>
            <p className={styles.textSmall}>Tiền dịch vụ: {props.totalServiceCost.toLocaleString("vi-VN")}đ</p>
            <p className={styles.textSmall}><strong>Tổng tạm tính: {props.grandTotalCost.toLocaleString("vi-VN")}đ</strong></p>
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