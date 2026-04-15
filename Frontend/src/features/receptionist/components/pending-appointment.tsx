import type { ReceptionistAppointment } from "@/services/receptionistService";
import styles from "@/styles/common.module.css";

interface PendingAppointmentsProps {
  appointments: ReceptionistAppointment[];
  onConfirmClick: (appointment: ReceptionistAppointment) => void;
  onCancelClick: (id: number) => void;
  disabled?: boolean;
}

export function PendingAppointments({ appointments, onConfirmClick, onCancelClick, disabled = false }: PendingAppointmentsProps) {
  const toGenderLabel = (gender?: string | null) => {
    const normalized = (gender ?? "").trim().toUpperCase();
    if (normalized === "MALE" || normalized === "NAM") {
      return "Nam";
    }
    if (normalized === "FEMALE" || normalized === "NU" || normalized === "NỮ") {
      return "Nữ";
    }
    return "Khác";
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.mb3}>Lịch hẹn chờ xác nhận ({appointments.length})</h2>
      <div>
        {appointments.length === 0 ? (
          <div className={styles.textCenter} style={{ padding: "3rem", color: "#9ca3af" }}>
            Không có lịch hẹn chờ xác nhận
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.flexBetween}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    {appointment.patient.fullName}
                  </h3>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
                    <span>📞 {appointment.patient.phoneNumber || "Chưa có"}</span>
                    <span>🆔 {appointment.patient.nationalId || "Chưa có"}</span>
                    <span>👤 {toGenderLabel(appointment.patient.gender)}</span>
                  </div>
                  <div style={{ backgroundColor: "#f3f4f6", padding: "0.75rem", borderRadius: "0.375rem" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                      Triệu chứng:
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{appointment.symptoms || "Chưa có"}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className={`${styles.button} ${styles.primary}`} onClick={() => onConfirmClick(appointment)} disabled={disabled}>
                    Xác nhận
                  </button>
                  <button className={`${styles.button} ${styles.outline}`} onClick={() => onCancelClick(appointment.id)} disabled={disabled}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}