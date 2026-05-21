import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DiagnosisTemplateResponse } from "@/services/doctorService";
import styles from "@/styles/common.module.css";
import type { MedicalRecordInput } from "@/types/doctor.type";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
};

interface MedicalRecordFormProps {
  medicalRecord: MedicalRecordInput;
  diagnosisOptions: DiagnosisTemplateResponse[];
  selectedDiagnosisId: number | null;
  diagnosisLoading: boolean;
  historyRows: any[];
  historyDetail: any;
  historyLoading: boolean;
  historyDetailLoading: boolean;
  onDiagnosisSelect: (diagnosisId: number) => void;
  onChange: (field: string, value: string) => void;
  onViewHistory: (historyId: number) => void;
}

export function MedicalRecordForm(props: MedicalRecordFormProps) {
  const idBase = useId();
  const selectId = `${idBase}-diagnosis`;
  const textareaId = `${idBase}-doctor-advice`;
  return (
    <>
      <div className={styles.formGroup}>
        <Label className={styles.label} htmlFor={selectId}>Chẩn đoán *</Label>
        <select
          id={selectId}
          name="diagnosis"
          className={styles.input}
          value={props.selectedDiagnosisId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              return;
            }
            try {
              console.debug("[Debug] MedicalRecordForm.onChange - value:", value);
              console.debug("[Debug] MedicalRecordForm - diagnosisOptions:", props.diagnosisOptions);
              console.debug("[Debug] MedicalRecordForm - selectedDiagnosisId (before):", props.selectedDiagnosisId);
            } catch (err) {}
            props.onDiagnosisSelect(Number(value));
          }}
          disabled={props.diagnosisLoading || props.diagnosisOptions.length === 0}
        >
          <option value="">{props.diagnosisLoading ? "Đang tải chẩn đoán..." : "-- Chọn chẩn đoán --"}</option>
          {props.diagnosisOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.diagnosisName}
            </option>
          ))}
        </select>
        {props.diagnosisOptions.length === 0 && !props.diagnosisLoading && (
          <p className={styles.textSmall} style={{ marginTop: "0.5rem" }}>
            Chuyên khoa này chưa có danh sách chẩn đoán mẫu.
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label} htmlFor={textareaId}>Phương pháp điều trị / Lời khuyên *</Label>
        <Textarea
          id={textareaId}
          name="doctor_advice"
          className={styles.input}
          rows={3}
          value={props.medicalRecord.doctor_advice}
          onChange={(e) => props.onChange("doctor_advice", e.target.value)}
          placeholder="Lời khuyên sẽ tự điền từ chẩn đoán mẫu và có thể chỉnh sửa..."
        />
      </div>

      {/* Phần hiển thị lịch sử khám cũ */}
      <div className={styles.panelBorder}>
        <div className={`${styles.flexBetween} ${styles.mb2}`}>
          <h4 className={styles.titleSmall}>Hồ sơ bệnh án cũ của bệnh nhân</h4>
          <span className={styles.textSmall}>Đối chiếu tiền sử khám</span>
        </div>
        
        {props.historyLoading && <p className={styles.textSmall}>Đang tải lịch sử bệnh án...</p>}
        
        {!props.historyLoading && props.historyRows.length > 0 && (
          <div className={styles.rowStack}>
            {props.historyRows.map((row) => (
              <div key={row.medicalRecordId} className={styles.itemCard}>
                <div className={styles.flexBetween}>
                  <div>
                    <p className={styles.textSmall}><strong>Ngày khám:</strong> {formatDate(row.appointmentTime)}</p>
                    <p className={styles.textSmall}><strong>Chẩn đoán cũ:</strong> {row.oldDiagnosis || "-"}</p>
                  </div>
                  <button type="button" className={`${styles.button} ${styles.outline}`} onClick={() => props.onViewHistory(row.medicalRecordId)}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}