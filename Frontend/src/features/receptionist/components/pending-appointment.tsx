import type { AppointmentWithDetails } from "../mock-data";
import styles from "@/styles/common.module.css";

interface PendingAppointmentsProps {
  appointments: AppointmentWithDetails[];
  onConfirmClick: (appointment: AppointmentWithDetails) => void;
  onCancelClick: (id: number) => void;
}

export function PendingAppointments({ appointments, onConfirmClick, onCancelClick }: PendingAppointmentsProps) {
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
                    {appointment.patient.full_name}
                  </h3>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
                    <span>📞 {appointment.patient.phone_number}</span>
                    <span>🆔 {appointment.patient.national_id}</span>
                    <span>👤 {appointment.patient.gender === "male" ? "Nam" : "Nữ"}</span>
                  </div>
                  <div style={{ backgroundColor: "#f3f4f6", padding: "0.75rem", borderRadius: "0.375rem" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                      Triệu chứng:
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{appointment.symptoms}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className={`${styles.button} ${styles.primary}`} onClick={() => onConfirmClick(appointment)}>
                    Xác nhận
                  </button>
                  <button className={`${styles.button} ${styles.outline}`} onClick={() => onCancelClick(appointment.id)}>
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