'use client';

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ExaminationModal } from "./components/examination-modal";
import { mockAppointments, mockMedicines } from "./mock-data";
import type { Appointment, MedicalRecordInput, Medicine, PrescriptionItem } from "./types";
import styles from "@/styles/common.module.css";

export function DoctorQueue() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"waiting" | "completed">("waiting");
  const [isExamining, setIsExamining] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordInput>({ diagnosis: "", doctor_advice: "" });
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);

  const waitingAppointments = appointments.filter((a) => a.status === "confirmed");
  const examiningAppointments = appointments.filter((a) => a.status === "pending");
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  const handleStartExam = (appointment: Appointment) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === appointment.id ? { ...item, status: "pending" } : item)),
    );
    setSelectedAppointment(appointment);
    setIsExamining(true);
    setMedicalRecord({
      diagnosis: appointment.diagnosis ?? "",
      doctor_advice: appointment.doctor_advice ?? "",
    });
    setPrescriptions(appointment.prescription_items ?? []);
  };

  const handleMedicalRecordChange = (field: string, value: string) => {
    setMedicalRecord(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMedicine = (medicine: Medicine) => {
    if (prescriptions.find((p) => p.medicine_id === medicine.id)) {
      toast.error("Thuốc này đã được thêm vào đơn");
      return;
    }
    setPrescriptions((prev) => [
      ...prev,
      { medicine_id: medicine.id, quantity: 1, usage_instructions: "", medicine },
    ]);
  };

  const handleUpdatePrescription = (
    medicineId: number,
    field: "quantity" | "usage_instructions",
    value: number | string,
  ) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.medicine_id === medicineId ? { ...p, [field]: value } : p,
      ),
    );
  };

  const handleRemoveMedicine = (medicineId: number) => {
    setPrescriptions((prev) => prev.filter((p) => p.medicine_id !== medicineId));
  };

  const getTotalMedicineCost = () => {
    return prescriptions.reduce((sum, p) => sum + (p.medicine?.selling_price || 0) * p.quantity, 0);
  };
  const handleCompleteExam = () => {
    if (!selectedAppointment) {
      return;
    }

    if (!medicalRecord.diagnosis || !medicalRecord.doctor_advice) {
      toast.error("Vui lòng điền đầy đủ chẩn đoán và hướng dẫn điều trị");
      return;
    }
    if (prescriptions.length > 0 && prescriptions.some((p) => !p.usage_instructions.trim())) {
      toast.error("Vui lòng nhập hướng dẫn sử dụng cho tất cả thuốc");
      return;
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedAppointment.id
          ? {
              ...a,
              status: "completed" as const,
              diagnosis: medicalRecord.diagnosis,
              doctor_advice: medicalRecord.doctor_advice,
              prescription_items: prescriptions,
              total_medicine_cost: getTotalMedicineCost(),
            }
          : a,
      ),
    );
    setIsExamining(false);
    setSelectedAppointment(null);
    setMedicalRecord({ diagnosis: "", doctor_advice: "" });
    setPrescriptions([]);
    toast.success("Đã hoàn thành khám bệnh và gửi đơn thuốc");
  };

  const handleCloseExam = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppointment.id && item.status === "pending"
            ? { ...item, status: "confirmed" }
            : item,
        ),
      );
    }
    setIsExamining(false);
    setSelectedAppointment(null);
    setMedicalRecord({ diagnosis: "", doctor_advice: "" });
    setPrescriptions([]);
  };

  return (
      <main className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Bàn khám bệnh - Bác sĩ</h1>
            <p>Quản lý hàng đợi, khám bệnh và kê đơn thuốc theo ca.</p>
          </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconOrange}>
            <Clock size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>Đang chờ khám</h3>
            <p className={styles.statValue}>{waitingAppointments.length}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconBlue}>
            <Stethoscope size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>Đang khám</h3>
            <p className={styles.statValue}>{examiningAppointments.length}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconGreen}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.statContent}>
            <h3>Đã hoàn thành</h3>
            <p className={styles.statValue}>{completedAppointments.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.tabRow}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "waiting" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("waiting")}
        >
          <Users size={16} /> Hàng đợi ({waitingAppointments.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "completed" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          <CheckCircle size={16} /> Đã khám ({completedAppointments.length})
        </button>
      </div>

      {activeTab === "waiting" && (
        <div className={styles.card}>
          <h2 className={styles.mb3}>Danh sách bệnh nhân chờ khám</h2>
          {waitingAppointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.flexBetweenStart}>
                <div className={styles.queueBadge}>{appointment.queue_number}</div>
                <div className={styles.appointmentMain}>
                  <div className={styles.flexBetween}>
                    <div>
                      <h3 className={styles.appointmentName}>{appointment.patient.full_name}</h3>
                      <p className={styles.textSmall}>BS phụ trách: {appointment.doctor_name}</p>
                    </div>
                    <span className={styles.timeBadge}>{appointment.scheduled_time}</span>
                  </div>

                  <div className={styles.infoGrid}>
                    <p className={styles.textSmall}>SĐT: {appointment.patient.phone_number}</p>
                    <p className={styles.textSmall}>Ngày sinh: {new Date(appointment.patient.date_of_birth).toLocaleDateString("vi-VN")}</p>
                    <p className={styles.textSmall}>Quê quán: {appointment.patient.hometown}</p>
                    <p className={styles.textSmall}>CCCD: {appointment.patient.national_id}</p>
                  </div>

                  <div className={styles.reasonBox}>
                    <p className={styles.textSmall}><strong>Triệu chứng:</strong> {appointment.symptoms}</p>
                  </div>

                  <div className={styles.flexBetween}>
                    <div>
                      {!!appointment.patient.insurance_number && (
                        <span className={styles.insuranceBadge}>BHYT: {appointment.patient.insurance_number}</span>
                      )}
                    </div>
                    <button className={`${styles.button} ${styles.primary}`} onClick={() => handleStartExam(appointment)}>
                      Bắt đầu khám
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {waitingAppointments.length === 0 && (
            <div className={styles.emptyBox}>Không có bệnh nhân trong hàng đợi</div>
          )}
        </div>
      )}

      {activeTab === "completed" && (
        <div className={styles.card}>
          <h2 className={styles.mb3}>Danh sách đã khám</h2>
          {completedAppointments.map((appointment) => (
            <div key={appointment.id} className={styles.completedCard}>
              <div className={styles.flexBetween}>
                <div>
                  <h3 className={styles.appointmentName}>{appointment.patient.full_name}</h3>
                  <p className={styles.textSmall}>{appointment.patient.phone_number}</p>
                </div>
                <span className={styles.completedBadge}>Đã khám</span>
              </div>

              <div className={styles.noteBlue}>
                <p className={styles.textSmall}><strong>Chẩn đoán:</strong> {appointment.diagnosis || "-"}</p>
              </div>
              <div className={styles.noteGreen}>
                <p className={styles.textSmall}><strong>Điều trị:</strong> {appointment.doctor_advice || "-"}</p>
              </div>

              {!!appointment.prescription_items?.length && (
                <div className={styles.notePurple}>
                  <div className={styles.flexBetween}>
                    <p className={styles.textSmall}><strong>Đơn thuốc</strong></p>
                    <p className={styles.textSmall}><strong>Tổng: {appointment.total_medicine_cost?.toLocaleString("vi-VN")}đ</strong></p>
                  </div>
                  <div className={styles.rowStack}>
                    {appointment.prescription_items.map((item) => (
                      <div key={item.medicine_id} className={styles.itemCard}>
                        <div className={styles.flexBetween}>
                          <span className={styles.textSmall}>
                            {item.medicine.medicine_name} {item.medicine.dosage}
                          </span>
                          <span className={styles.textSmall}>
                            {(item.medicine.selling_price * item.quantity).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <p className={styles.textSmall}>
                          Số lượng: {item.quantity} {item.medicine.unit} - {item.usage_instructions}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {completedAppointments.length === 0 && (
            <div className={styles.emptyBox}>Chưa có bệnh nhân đã khám</div>
          )}
        </div>
      )}

          {isExamining && selectedAppointment && (
            <ExaminationModal
              appointment={selectedAppointment}
              medicalRecord={medicalRecord}
              prescriptions={prescriptions}
              availableMedicines={mockMedicines}
              totalCost={getTotalMedicineCost()}
              onClose={handleCloseExam}
              onComplete={handleCompleteExam}
              onMedicalRecordChange={handleMedicalRecordChange}
              onAddMedicine={handleAddMedicine}
              onUpdatePrescription={handleUpdatePrescription}
              onRemoveMedicine={handleRemoveMedicine}
            />
          )}
        </div>
      </main>
  );
}