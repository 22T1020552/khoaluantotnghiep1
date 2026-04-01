import { useState } from "react";
import type { User } from "@/types/user.type";
import type { AppointmentWithDetails } from "../mock-data";
import styles from "@/styles/common.module.css";

interface ConfirmModalProps {
  appointment: AppointmentWithDetails;
  doctors: User[];
  onClose: () => void;
  onConfirm: (doctorId: number, time: string) => void;
}

export function ConfirmModal({ appointment, doctors, onClose, onConfirm }: ConfirmModalProps) {
  // Quản lý state riêng cho Modal
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [time, setTime] = useState("");

  const handleSubmit = () => {
    if (!doctorId || !time) {
      alert("Vui lòng chọn bác sĩ và thời gian khám");
      return;
    }
    onConfirm(Number(doctorId), time);
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Xác nhận lịch hẹn - {appointment.patient.full_name}</h2>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          {/* Tóm tắt thông tin bệnh nhân */}
          <div style={{ backgroundColor: "#f9fafb", padding: "1rem", borderRadius: "0.375rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Bệnh nhân: {appointment.patient.full_name}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>SĐT: {appointment.patient.phone_number}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Triệu chứng: {appointment.symptoms}</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Chọn bác sĩ *</label>
            <select
              className={styles.input}
              value={doctorId}
              onChange={(e) => setDoctorId(Number(e.target.value))}
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  BS. {doctor.username}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Thời gian khám *</label>
            <input
              type="datetime-local"
              className={styles.input}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }} onClick={handleSubmit}>
            Xác nhận lịch hẹn
          </button>
          <button className={`${styles.button} ${styles.outline}`} style={{ flex: 1 }} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}