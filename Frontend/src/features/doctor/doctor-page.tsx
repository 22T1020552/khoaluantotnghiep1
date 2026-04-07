'use client';

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Stethoscope, Users } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/services/api";
import { doctorService, type PrescriptionCatalogMedicine } from "@/services/doctorService";
import type { Appointment, MedicalRecordInput, Medicine, PrescriptionItem } from "@/types/doctor.type";
import styles from "@/styles/common.module.css";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("vi-VN");
};

const formatTime = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const mapCatalogToMedicine = (item: PrescriptionCatalogMedicine): Medicine => ({
  id: item.medicineId,
  medicine_name: item.medicineName,
  dosage: item.concentration || "",
  category: item.pharmacologyGroup || "Khác",
  unit: item.unit || "đv",
  stock_quantity: item.stockQuantity || 0,
  selling_price: item.sellingPrice || 0,
});

export function DoctorQueue() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"waiting" | "completed">("waiting");
  const [isExamining, setIsExamining] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordInput>({ diagnosis: "", doctor_advice: "" });
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const waitingAppointments = appointments.filter((a) => a.status === "confirmed");
  const examiningAppointments = appointments.filter((a) => a.status === "pending");
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const [waiting, completed] = await Promise.all([
        doctorService.getWaitingPatients(),
        doctorService.getCompletedPatients(),
      ]);

      let queue = 1;
      const waitingMapped: Appointment[] = waiting.map((item) => ({
        id: item.id,
        patient: {
          id: item.patient.id,
          full_name: item.patient.fullName || "Chưa cập nhật",
          date_of_birth: "",
          phone_number: item.patient.phoneNumber || "",
          hometown: "",
          national_id: item.patient.nationalId || "",
          insurance_number: item.patient.healthInsuranceNumber || "",
          gender: item.patient.gender?.toUpperCase() === "FEMALE" ? "female" : "male",
        },
        doctor_name: item.doctor?.username || "BS phụ trách",
        symptoms: item.symptoms || "",
        scheduled_time: formatTime(item.appointmentTime),
        appointment_time: item.appointmentTime,
        queue_number: queue++,
        status: "confirmed",
      }));

      const completedMapped: Appointment[] = completed.map((item) => ({
        id: item.id,
        patient: {
          id: item.patient.id,
          full_name: item.patient.fullName || "Chưa cập nhật",
          date_of_birth: "",
          phone_number: item.patient.phoneNumber || "",
          hometown: "",
          national_id: item.patient.nationalId || "",
          insurance_number: item.patient.healthInsuranceNumber || "",
          gender: item.patient.gender?.toUpperCase() === "FEMALE" ? "female" : "male",
        },
        doctor_name: item.doctor?.username || "BS phụ trách",
        symptoms: item.symptoms || "",
        scheduled_time: formatTime(item.appointmentTime),
        appointment_time: item.appointmentTime,
        queue_number: 0,
        status: "completed",
      }));

      setAppointments([...waitingMapped, ...completedMapped]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải danh sách khám"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const handleStartExam = async (appointment: Appointment) => {
    try {
      setSaving(true);
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

      const record = await doctorService.getMedicalRecordByAppointment(appointment.id).catch(() => null);
      if (record) {
        setMedicalRecordId(record.id);
        setMedicalRecord({
          diagnosis: record.diagnosis || "",
          doctor_advice: record.doctorAdvice || "",
        });

        const workspace = await doctorService.getPrescriptionWorkspace(record.id);
        const mappedMeds = (workspace.medicineCatalog || []).map(mapCatalogToMedicine);
        const byId = new Map<number, Medicine>(mappedMeds.map((m) => [m.id, m]));
        setAvailableMedicines(mappedMeds);
        setPrescriptions(
          (workspace.prescribedMedicines || []).map((line) => ({
            medicine_id: line.medicineId,
            quantity: line.quantity,
            usage_instructions: line.usageInstructions,
            medicine:
              byId.get(line.medicineId) ||
              ({
                id: line.medicineId,
                medicine_name: line.medicineName,
                dosage: "",
                category: "Khác",
                unit: line.unit || "đv",
                stock_quantity: 0,
                selling_price: line.sellingPrice,
              } as Medicine),
          })),
        );
      } else {
        setMedicalRecordId(null);
        const medicines = await doctorService.getAvailableMedicines();
        setAvailableMedicines(
          medicines
            .filter((item) => item.isActive)
            .map((item) => ({
              id: item.id,
              medicine_name: item.medicineName,
              dosage: "",
              category: item.medicineType || "Khác",
              unit: item.unit || "đv",
              stock_quantity: item.stockQuantity,
              selling_price: item.sellingPrice,
            })),
        );
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể mở ca khám"));
      setIsExamining(false);
    } finally {
      setSaving(false);
    }
  };

  const handleMedicalRecordChange = (field: string, value: string) => {
    setMedicalRecord((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMedicine = async (medicine: Medicine) => {
    if (prescriptions.find((p) => p.medicine_id === medicine.id)) {
      toast.error("Thuốc này đã được thêm vào đơn");
      return;
    }

    if (medicalRecordId) {
      try {
        await doctorService.addPrescriptionDetail(medicalRecordId, {
          medicineId: medicine.id,
          quantity: 1,
          usageInstructions: "",
        });
      } catch {
        // Keep local append for draft mode.
      }
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

  const handleRemoveMedicine = async (medicineId: number) => {
    if (medicalRecordId) {
      try {
        await doctorService.removePrescriptionDetail(medicalRecordId, medicineId);
      } catch {
        // Keep local remove when server line is not persisted yet.
      }
    }
    setPrescriptions((prev) => prev.filter((p) => p.medicine_id !== medicineId));
  };

  const getTotalMedicineCost = () => {
    return prescriptions.reduce((sum, p) => sum + (p.medicine?.selling_price || 0) * p.quantity, 0);
  };

  const handleCompleteExam = async () => {
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

    try {
      setSaving(true);

      let recordId = medicalRecordId;
      if (!recordId) {
        const created = await doctorService.createMedicalRecord({
          appointmentId: selectedAppointment.id,
          diagnosis: medicalRecord.diagnosis,
          doctorAdvice: medicalRecord.doctor_advice,
        });
        recordId = created.id;
        setMedicalRecordId(recordId);
      }

      if (!recordId) {
        throw new Error("Không tạo được bệnh án");
      }

      for (const item of prescriptions) {
        try {
          await doctorService.updatePrescriptionDetail(recordId, item.medicine_id, {
            quantity: item.quantity,
            usageInstructions: item.usage_instructions,
          });
        } catch {
          await doctorService.addPrescriptionDetail(recordId, {
            medicineId: item.medicine_id,
            quantity: item.quantity,
            usageInstructions: item.usage_instructions,
          });
        }
      }

      await doctorService.savePrescription(recordId);
      await doctorService.completeMedicalRecord(recordId);

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
      setMedicalRecordId(null);
      setMedicalRecord({ diagnosis: "", doctor_advice: "" });
      setPrescriptions([]);
      toast.success("Đã hoàn thành khám bệnh và gửi đơn thuốc");
      await loadAppointments();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể hoàn thành ca khám"));
    } finally {
      setSaving(false);
    }
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
    setMedicalRecordId(null);
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

        {loading && <div className={styles.emptyBox}>Đang tải dữ liệu...</div>}

        {!loading && activeTab === "waiting" && (
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
                      <p className={styles.textSmall}>Ngày sinh: {formatDate(appointment.patient.date_of_birth) || "Chưa cập nhật"}</p>
                      <p className={styles.textSmall}>Quê quán: {appointment.patient.hometown || "Chưa cập nhật"}</p>
                      <p className={styles.textSmall}>CCCD: {appointment.patient.national_id || "Chưa cập nhật"}</p>
                    </div>

                    <div className={styles.reasonBox}>
                      <p className={styles.textSmall}><strong>Triệu chứng:</strong> {appointment.symptoms || "Chưa cập nhật"}</p>
                    </div>

                    <div className={styles.flexBetween}>
                      <div>
                        {!!appointment.patient.insurance_number && (
                          <span className={styles.insuranceBadge}>BHYT: {appointment.patient.insurance_number}</span>
                        )}
                      </div>
                      <button className={`${styles.button} ${styles.primary}`} onClick={() => void handleStartExam(appointment)} disabled={saving}>
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

        {!loading && activeTab === "completed" && (
          <div className={styles.card}>
            <h2 className={styles.mb3}>Danh sách đã khám</h2>
            {completedAppointments.map((appointment) => (
              <div key={appointment.id} className={styles.completedCard}>
                <div className={styles.flexBetween}>
                  <div>
                    <h3 className={styles.appointmentName}>{appointment.patient.full_name}</h3>
                    <p className={styles.textSmall}>{appointment.patient.phone_number || "Chưa cập nhật"}</p>
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
          <div className={styles.modal} onClick={handleCloseExam}>
            <div className={`${styles.modalContent} ${styles.modalContentWide}`} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Khám bệnh - {selectedAppointment.patient.full_name}</h2>
              </div>

              <div className={styles.sectionBlock}>
                <div className={styles.panelMuted}>
                  <h3 className={styles.titleSmall}>Thông tin bệnh nhân</h3>
                  <div className={styles.grid2}>
                    <p className={styles.textSmall}><span className={styles.textMuted}>Họ tên:</span> {selectedAppointment.patient.full_name}</p>
                    <p className={styles.textSmall}><span className={styles.textMuted}>Ngày sinh:</span> {formatDate(selectedAppointment.patient.date_of_birth) || "Chưa cập nhật"}</p>
                    <p className={styles.textSmall}><span className={styles.textMuted}>SĐT:</span> {selectedAppointment.patient.phone_number || "Chưa cập nhật"}</p>
                    <p className={styles.textSmall}><span className={styles.textMuted}>Quê quán:</span> {selectedAppointment.patient.hometown || "Chưa cập nhật"}</p>
                    <p className={styles.textSmall}><span className={styles.textMuted}>CMND:</span> {selectedAppointment.patient.national_id || "Chưa cập nhật"}</p>
                    <p className={styles.textSmall}><span className={styles.textMuted}>Giới tính:</span> {selectedAppointment.patient.gender === "female" ? "Nữ" : "Nam"}</p>
                    {!!selectedAppointment.patient.insurance_number && (
                      <p className={styles.textSmall}><span className={styles.textMuted}>BHYT:</span> {selectedAppointment.patient.insurance_number}</p>
                    )}
                  </div>
                  <p className={styles.panelWarning}><span className={styles.textMedium}>Triệu chứng:</span> {selectedAppointment.symptoms || "Chưa cập nhật"}</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Chẩn đoán *</label>
                  <textarea
                    className={styles.input}
                    rows={3}
                    value={medicalRecord.diagnosis}
                    onChange={(e) => handleMedicalRecordChange("diagnosis", e.target.value)}
                    placeholder="Nhập chẩn đoán..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phương pháp điều trị / Lời khuyên *</label>
                  <textarea
                    className={styles.input}
                    rows={3}
                    value={medicalRecord.doctor_advice}
                    onChange={(e) => handleMedicalRecordChange("doctor_advice", e.target.value)}
                    placeholder="Nhập lời khuyên điều trị..."
                  />
                </div>

                <div>
                  <label className={styles.label}>Đơn thuốc</label>

                  {prescriptions.length > 0 && (
                    <div className={styles.panelPurple}>
                      <div className={`${styles.flexBetween} ${styles.mb2}`}>
                        <h4 className={styles.titleSmall}>Thuốc đã kê</h4>
                        <span className={styles.titleSmall}>
                          Tổng: {getTotalMedicineCost().toLocaleString("vi-VN")}đ
                        </span>
                      </div>

                      <div className={styles.rowStack}>
                        {prescriptions.map((item) => (
                          <div key={item.medicine_id} className={styles.itemCard}>
                            <div className={`${styles.flexBetween} ${styles.mb1}`}>
                              <span className={styles.titleSmall}>
                                {item.medicine?.medicine_name} {item.medicine?.dosage}
                              </span>
                              <span>{((item.medicine?.selling_price || 0) * item.quantity).toLocaleString("vi-VN")}đ</span>
                            </div>

                            <div className={`${styles.grid2} ${styles.mb1}`}>
                              <div>
                                <label className={`${styles.textSmall} ${styles.textMuted}`}>Số lượng</label>
                                <input
                                  type="number"
                                  className={`${styles.input} ${styles.compactInput}`}
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdatePrescription(item.medicine_id, "quantity", parseInt(e.target.value, 10) || 1)}
                                />
                              </div>
                              <div>
                                <label className={`${styles.textSmall} ${styles.textMuted}`}>Đơn vị</label>
                                <input className={`${styles.input} ${styles.compactInput}`} value={item.medicine?.unit} disabled />
                              </div>
                            </div>

                            <div>
                              <label className={`${styles.textSmall} ${styles.textMuted}`}>Hướng dẫn sử dụng *</label>
                              <input
                                className={`${styles.input} ${styles.compactInput}`}
                                placeholder="VD: Uống 2 viên/ngày sau ăn"
                                value={item.usage_instructions}
                                onChange={(e) => handleUpdatePrescription(item.medicine_id, "usage_instructions", e.target.value)}
                              />
                            </div>

                            <button
                              className={`${styles.button} ${styles.outline} ${styles.fullButton} ${styles.textDanger}`}
                              onClick={() => void handleRemoveMedicine(item.medicine_id)}
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.panelBorder}>
                    <h4 className={styles.mb2}>Danh mục thuốc</h4>
                    <div className={styles.categoryTabs}>
                      {Array.from(new Set(availableMedicines.map((medicine) => medicine.category))).map((category) => (
                        <span key={category} className={`${styles.categoryTab} ${styles.categoryTabActive}`}>{category}</span>
                      ))}
                    </div>

                    <div className={styles.medicineGrid}>
                      {availableMedicines.map((medicine) => (
                        <div
                          key={medicine.id}
                          className={styles.medicineItem}
                          onClick={() => void handleAddMedicine(medicine)}
                        >
                          <p className={`${styles.textMedium} ${styles.textSmall}`}>{medicine.medicine_name}</p>
                          <p className={`${styles.textSmall} ${styles.textMuted}`}>{medicine.dosage}</p>
                          <p className={`${styles.textSmall} ${styles.textMuted}`}>
                            {medicine.selling_price.toLocaleString("vi-VN")}đ/{medicine.unit}
                          </p>
                          <p className={`${styles.textSmall} ${styles.textMuted}`}>Tồn: {medicine.stock_quantity}</p>
                        </div>
                      ))}

                      {availableMedicines.length === 0 && (
                        <p className={styles.textSmall}>Không có thuốc đang hoạt động.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actionRow}>
                <button className={`${styles.button} ${styles.primary} ${styles.actionButtonGrow}`} onClick={() => void handleCompleteExam()} disabled={saving}>
                  Hoàn thành khám
                </button>
                <button className={`${styles.button} ${styles.outline} ${styles.actionButtonGrow}`} onClick={handleCloseExam} disabled={saving}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
