import styles from "@/styles/common.module.css";

interface MedicalRecordFormProps {
  diagnosis: string;
  doctorAdvice: string;
  onChange: (field: string, value: string) => void;
}

export function MedicalRecordForm({ diagnosis, doctorAdvice, onChange }: MedicalRecordFormProps) {
  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>Chẩn đoán *</label>
        <textarea
          className={styles.input}
          rows={3}
          value={diagnosis}
          onChange={(e) => onChange("diagnosis", e.target.value)}
          placeholder="Nhập chẩn đoán..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Phương pháp điều trị / Lời khuyên *</label>
        <textarea
          className={styles.input}
          rows={3}
          value={doctorAdvice}
          onChange={(e) => onChange("doctor_advice", e.target.value)}
          placeholder="Nhập lời khuyên điều trị..."
        />
      </div>
    </>
  );
}