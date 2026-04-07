import type { ReceptionistAppointment } from "@/services/receptionistService";
import styles from "@/styles/common.module.css";

interface ConfirmedAppointmentsProps {
  appointments: ReceptionistAppointment[];
  resolveRoomName: (doctorId?: number) => string;
}

export function ConfirmedAppointments({ appointments, resolveRoomName }: ConfirmedAppointmentsProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.mb3}>Lịch hẹn đã xác nhận ({appointments.length})</h2>
      <div>
        {appointments.length === 0 ? (
          <div className={styles.textCenter} style={{ padding: "3rem", color: "#9ca3af" }}>
            Không có lịch hẹn đã xác nhận
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.flexBetween}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {appointment.patient.fullName}
                    </h3>
                    <span className={`${styles.badge} ${styles.confirmed}`}>Đã xác nhận</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    <p>📅 Thời gian: {new Date(appointment.appointmentTime).toLocaleString("vi-VN")}</p>
                    <p>👨‍⚕️ Bác sĩ: {appointment.doctor?.username || "Chưa phân công"}</p>
                    <p>🏥 Phòng khám: {resolveRoomName(appointment.doctor?.id)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}