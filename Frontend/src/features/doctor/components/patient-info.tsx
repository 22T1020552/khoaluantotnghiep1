import type { Patient } from "../types";
import styles from "@/styles/common.module.css";

interface PatientInfoProps {
  patient: Patient;
  symptoms: string;
}

export function PatientInfo({ patient, symptoms }: PatientInfoProps) {
  return (
    <div className={styles.panelMuted}>
      <h3 className={styles.titleSmall}>
        Thông tin bệnh nhân
      </h3>
      <div className={styles.grid2}>
        <p className={styles.textSmall}>
          <span className={styles.textMuted}>Họ tên:</span> {patient.full_name}
        </p>
        <p className={styles.textSmall}>
          <span className={styles.textMuted}>Ngày sinh:</span> {new Date(patient.date_of_birth).toLocaleDateString("vi-VN")}
        </p>
        <p className={styles.textSmall}>
          <span className={styles.textMuted}>SĐT:</span> {patient.phone_number}
        </p>
        <p className={styles.textSmall}>
          <span className={styles.textMuted}>Quê quán:</span> {patient.hometown}
        </p>
        <p className={styles.textSmall}>
          <span className={styles.textMuted}>CMND:</span> {patient.national_id}
        </p>
        <p className={styles.textSmall}>
          <span className={styles.textMuted}>Giới tính:</span>{" "}
          {patient.gender === "male" ? "Nam" : "Nữ"}
        </p>
        {!!patient.insurance_number && (
          <p className={styles.textSmall}>
            <span className={styles.textMuted}>BHYT:</span> {patient.insurance_number}
          </p>
        )}
      </div>
      <p className={styles.panelWarning}>
        <span className={styles.textMedium}>Triệu chứng:</span> {symptoms}
      </p>
    </div>
  );
}