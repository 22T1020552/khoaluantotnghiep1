import type { ReceptionistAppointment } from "@/services/receptionistService";
import styles from "@/styles/common.module.css";

interface ConfirmedAppointmentsProps {
  appointments: ReceptionistAppointment[];
  resolveRoomName: (doctorId?: number) => string;
}

export function ConfirmedAppointments({ appointments, resolveRoomName }: ConfirmedAppointmentsProps) {
<<<<<<< HEAD
=======
  const isNoShowCancelled = (appointment: ReceptionistAppointment) => {
    const status = (appointment.status ?? "").trim().toUpperCase();
    if (!["WAITING", "APPROVED", "CONFIRMED", "PENDING", "PENDING_CONFIRMATION", "DRAFT"].includes(status)) {
      return false;
    }

    const appointmentTimestamp = new Date(appointment.appointmentTime).getTime();
    if (Number.isNaN(appointmentTimestamp)) {
      return false;
    }

    return appointmentTimestamp < Date.now();
  };

>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  return (
    <div className={styles.card}>
      <h2 className={styles.mb3}>Lịch hẹn đã xác nhận ({appointments.length})</h2>
      <div>
        {appointments.length === 0 ? (
          <div className={styles.textCenter} style={{ padding: "3rem", color: "#9ca3af" }}>
            Không có lịch hẹn đã xác nhận
          </div>
        ) : (
<<<<<<< HEAD
          appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.flexBetween}>
                <div>
=======
          appointments.map((appointment) => {
            const noShowCancelled = isNoShowCancelled(appointment);

            return (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.flexBetween}>
                  <div>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                      {appointment.patient.fullName}
                    </h3>
<<<<<<< HEAD
                    <span className={`${styles.badge} ${styles.confirmed}`}>Đã xác nhận</span>
=======
                    <span className={`${styles.badge} ${noShowCancelled ? styles.cancelled : styles.confirmed}`}>
                      {noShowCancelled ? "Đã hủy do quá giờ" : "Đã xác nhận"}
                    </span>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    <p>📅 Thời gian: {new Date(appointment.appointmentTime).toLocaleString("vi-VN")}</p>
                    <p>👨‍⚕️ Bác sĩ: {appointment.doctor?.username || "Chưa phân công"}</p>
                    <p>🏥 Phòng khám: {resolveRoomName(appointment.doctor?.id)}</p>
                  </div>
<<<<<<< HEAD
                </div>
              </div>
            </div>
          ))
=======
                  {noShowCancelled && (
                    <div className={styles.panelWarning}>
                      Lịch hẹn đã quá thời gian và bệnh nhân không đến khám, hệ thống hiển thị là đã hủy.
                    </div>
                  )}
                  </div>
                </div>
              </div>
            );
          })
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
        )}
      </div>
    </div>
  );
}