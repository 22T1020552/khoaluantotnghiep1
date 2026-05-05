import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import styles from "@/styles/common.module.css";
import type { MedicalRecordInput } from "@/types/doctor.type";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
};

interface MedicalRecordFormProps {
  medicalRecord: MedicalRecordInput;
  historyRows: any[];
  historyDetail: any;
  historyLoading: boolean;
  historyDetailLoading: boolean;
  onChange: (field: string, value: string) => void;
  onViewHistory: (historyId: number) => void;
}

export function MedicalRecordForm(props: MedicalRecordFormProps) {
  return (
    <>
      <div className={styles.formGroup}>
        <Label className={styles.label}>Chẩn đoán *</Label>
        <Textarea
          className={styles.input}
          rows={3}
          value={props.medicalRecord.diagnosis}
          onChange={(e) => props.onChange("diagnosis", e.target.value)}
          placeholder="Nhập chẩn đoán..."
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>Phương pháp điều trị / Lời khuyên *</Label>
        <Textarea
          className={styles.input}
          rows={3}
          value={props.medicalRecord.doctor_advice}
          onChange={(e) => props.onChange("doctor_advice", e.target.value)}
          placeholder="Nhập lời khuyên điều trị..."
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