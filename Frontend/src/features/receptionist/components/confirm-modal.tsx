import { useState } from "react";
import type { ReceptionistAppointment, ReceptionistDoctorOption } from "@/services/receptionistService";
import styles from "@/styles/common.module.css";

interface ConfirmModalProps {
  appointment: ReceptionistAppointment;
  doctors: ReceptionistDoctorOption[];
  onClose: () => void;
  onConfirm: (doctorId: number, appointmentTime: string) => void;
  submitting?: boolean;
}

export function ConfirmModal({ appointment, doctors, onClose, onConfirm, submitting = false }: ConfirmModalProps) {
  // Quản lý state riêng cho Modal
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [appointmentTime, setAppointmentTime] = useState(() => {
    const date = new Date(appointment.appointmentTime);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  });

  const handleSubmit = () => {
    if (!doctorId) {
      alert("Vui lòng chọn bác sĩ");
      return;
    }
    if (!appointmentTime) {
      alert("Vui lòng chọn thời gian khám");
      return;
    }

    const selectedDoctor = doctors.find((doctor) => doctor.doctorId === Number(doctorId));
    if (!selectedDoctor?.roomName) {
      alert("Bác sĩ chưa có phòng khám. Vui lòng chọn bác sĩ khác.");
      return;
    }

    onConfirm(Number(doctorId), appointmentTime);
  };

  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === Number(doctorId));

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Xác nhận lịch hẹn - {appointment.patient.fullName}</h2>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          {/* Tóm tắt thông tin bệnh nhân */}
          <div style={{ backgroundColor: "#f9fafb", padding: "1rem", borderRadius: "0.375rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Bệnh nhân: {appointment.patient.fullName}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>SĐT: {appointment.patient.phoneNumber || "Chưa có"}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Triệu chứng: {appointment.symptoms || "Chưa có"}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Thời gian hẹn: {new Date(appointment.appointmentTime).toLocaleString("vi-VN")}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Chọn bác sĩ *</label>
            <select
              className={styles.input}
              value={doctorId}
              onChange={(e) => {
                const value = e.target.value;
                setDoctorId(value === "" ? "" : Number(value));
              }}
              disabled={submitting}
            >
              <option value="">-- Chọn bác sĩ --</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctorId} value={doctor.doctorId}>
                  BS. {doctor.doctorUsername}
                  {doctor.roomName ? ` - ${doctor.roomName}` : ""}
                </option>
              ))}
            </select>
            {doctors.length === 0 && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#b91c1c" }}>
                Hiện chưa có bác sĩ nào được gán phòng khám.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Thời gian khám *</label>
            <input
              type="datetime-local"
              className={styles.input}
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phòng khám *</label>
            <input
              className={styles.input}
              value={selectedDoctor?.roomName || "Vui lòng chọn bác sĩ"}
              readOnly
              disabled
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Xác nhận lịch hẹn"}
          </button>
          <button className={`${styles.button} ${styles.outline}`} style={{ flex: 1 }} onClick={onClose} disabled={submitting}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}