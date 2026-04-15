'use client';

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Stethoscope, Users } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/services/api";
import { doctorService, type DoctorMedicalService, type PrescriptionCatalogMedicine } from "@/services/doctorService";
import type {
  Appointment,
  MedicalRecordInput,
  Medicine,
  PrescriptionItem,
  SelectedServiceItem,
} from "@/types/doctor.type";
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

const mapDoctorAppointmentToUi = (
  item: Awaited<ReturnType<typeof doctorService.getWaitingPatients>>[number],
  queueNumber: number,
  status: "confirmed" | "completed",
): Appointment => ({
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
  queue_number: queueNumber,
  status,
});

export function DoctorQueue() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"waiting" | "completed">("waiting");
  const [isExamining, setIsExamining] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordInput>({ diagnosis: "", doctor_advice: "" });
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [availableServices, setAvailableServices] = useState<DoctorMedicalService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);
  const [activeMedicineCategory, setActiveMedicineCategory] = useState<string>("");
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  const [historyRows, setHistoryRows] = useState<Awaited<ReturnType<typeof doctorService.getPatientHistorySummary>>["histories"]>([]);
  const [historyDetail, setHistoryDetail] = useState<Awaited<ReturnType<typeof doctorService.getPatientHistoryDetail>> | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const waitingAppointments = appointments.filter((a) => a.status === "confirmed");
  const examiningAppointments = appointments.filter((a) => a.status === "pending");
  const completedAppointments = appointments.filter((a) => a.status === "completed");
  const medicineCategories = useMemo(
    () => Array.from(new Set(availableMedicines.map((medicine) => medicine.category))),
    [availableMedicines],
  );
  const filteredMedicines = useMemo(
    () =>
      availableMedicines.filter((medicine) =>
        activeMedicineCategory ? medicine.category === activeMedicineCategory : true,
      ),
    [activeMedicineCategory, availableMedicines],
  );

  useEffect(() => {
    if (!medicineCategories.length) {
      setActiveMedicineCategory("");
      return;
    }

    if (!activeMedicineCategory || !medicineCategories.includes(activeMedicineCategory)) {
      setActiveMedicineCategory(medicineCategories[0]);
    }
  }, [activeMedicineCategory, medicineCategories]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const [waiting, completed] = await Promise.all([
        doctorService.getWaitingPatients(),
        doctorService.getCompletedPatients(),
      ]);

      let queue = 1;
      const waitingMapped: Appointment[] = waiting.map((item) => mapDoctorAppointmentToUi(item, queue++, "confirmed"));

      const completedMappedBase: Appointment[] = completed.map((item) =>
        mapDoctorAppointmentToUi(item, 0, "completed"),
      );

      const completedMapped = await Promise.all(
        completedMappedBase.map(async (appointment) => {
          try {
            const record = await doctorService.getMedicalRecordByAppointment(appointment.id);
            const [workspace, detail] = await Promise.all([
              doctorService.getPrescriptionWorkspace(record.id).catch(() => null),
              doctorService.getPatientHistoryDetail(appointment.id, record.id).catch(() => null),
            ]);

            const mappedMeds = (workspace?.medicineCatalog || []).map(mapCatalogToMedicine);
            const byId = new Map<number, Medicine>(mappedMeds.map((m) => [m.id, m]));
            const prescriptionItems: PrescriptionItem[] = (workspace?.prescribedMedicines || []).map((line) => ({
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
            }));

            const serviceItems: SelectedServiceItem[] = (detail?.services || []).map((service) => ({
              service_id: service.serviceId,
              service_name: service.serviceName,
              quantity: service.quantity,
              actual_price: service.actualPrice,
              result_note: service.resultNote || "",
            }));

            const totalMedicineCost = prescriptionItems.reduce(
              (sum, item) => sum + (item.medicine?.selling_price || 0) * item.quantity,
              0,
            );
            const totalServiceCost = serviceItems.reduce(
              (sum, item) => sum + item.actual_price * item.quantity,
              0,
            );

            return {
              ...appointment,
              diagnosis: record.diagnosis || detail?.diagnosis || "",
              doctor_advice: record.doctorAdvice || detail?.doctorAdvice || "",
              prescription_items: prescriptionItems,
              service_items: serviceItems,
              total_medicine_cost: totalMedicineCost,
              total_service_cost: totalServiceCost,
              total_exam_cost: totalMedicineCost + totalServiceCost,
            };
          } catch {
            return appointment;
          }
        }),
      );

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
      setHistoryRows([]);
      setHistoryDetail(null);
      setMedicalRecord({
        diagnosis: appointment.diagnosis ?? "",
        doctor_advice: appointment.doctor_advice ?? "",
      });
      setPrescriptions(appointment.prescription_items ?? []);
      setSelectedServices(appointment.service_items ?? []);
      const services = await doctorService.getAvailableServices();
      setAvailableServices(services.filter((item) => item.isActive));

      setHistoryLoading(true);
      try {
        const history = await doctorService.getPatientHistorySummary(appointment.id);
        setHistoryRows(history.histories || []);
      } catch {
        setHistoryRows([]);
      } finally {
        setHistoryLoading(false);
      }

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

        const recordDetail = await doctorService.getPatientHistoryDetail(appointment.id, record.id).catch(() => null);
        setSelectedServices(
          (recordDetail?.services || []).map((service) => ({
            service_id: service.serviceId,
            service_name: service.serviceName,
            quantity: service.quantity,
            actual_price: service.actualPrice,
            result_note: service.resultNote || "",
          })),
        );
      } else {
        setMedicalRecordId(null);
        setSelectedServices([]);
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

  const handleAddService = (service: DoctorMedicalService) => {
    if (selectedServices.find((item) => item.service_id === service.id)) {
      toast.error("Dịch vụ này đã được thêm");
      return;
    }

    setSelectedServices((prev) => [
      ...prev,
      {
        service_id: service.id,
        service_name: service.serviceName,
        quantity: 1,
        actual_price: Number(service.currentPrice || 0),
        result_note: "",
      },
    ]);
  };

  const handleUpdateSelectedService = (
    serviceId: number,
    field: "quantity" | "actual_price" | "result_note",
    value: number | string,
  ) => {
    setSelectedServices((prev) =>
      prev.map((item) => (item.service_id === serviceId ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices((prev) => prev.filter((item) => item.service_id !== serviceId));
  };

  const getTotalMedicineCost = () => {
    return prescriptions.reduce((sum, p) => sum + (p.medicine?.selling_price || 0) * p.quantity, 0);
  };

  const getTotalServiceCost = () => {
    return selectedServices.reduce((sum, item) => sum + item.actual_price * item.quantity, 0);
  };

  const getGrandTotalCost = () => {
    return getTotalMedicineCost() + getTotalServiceCost();
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
    if (selectedServices.some((item) => item.quantity < 1 || item.actual_price <= 0)) {
      toast.error("Số lượng dịch vụ phải >= 1 và đơn giá phải > 0");
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

      for (const service of selectedServices) {
        await doctorService.upsertMedicalRecordServiceResult(recordId, {
          serviceId: service.service_id,
          quantity: service.quantity,
          actualPrice: service.actual_price,
          resultNote: service.result_note?.trim() || undefined,
        });
      }

      if (prescriptions.length > 0) {
        await doctorService.savePrescription(recordId);
      }
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
                service_items: selectedServices,
                total_medicine_cost: getTotalMedicineCost(),
                total_service_cost: getTotalServiceCost(),
                total_exam_cost: getGrandTotalCost(),
              }
            : a,
        ),
      );
      setIsExamining(false);
      setSelectedAppointment(null);
      setMedicalRecordId(null);
      setMedicalRecord({ diagnosis: "", doctor_advice: "" });
      setPrescriptions([]);
      setSelectedServices([]);
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
    setSelectedServices([]);
    setHistoryRows([]);
    setHistoryDetail(null);
    setHistoryLoading(false);
    setHistoryDetailLoading(false);
  };

  const handleViewHistoryDetail = async (appointmentId: number, historyMedicalRecordId: number) => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setHistoryDetailLoading(true);
      const detail = await doctorService.getPatientHistoryDetail(appointmentId, historyMedicalRecordId);
      setHistoryDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải chi tiết hồ sơ cũ"));
    } finally {
      setHistoryDetailLoading(false);
    }
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
                <div className={styles.cardLayout}>
                  
                  {/* Cột trái: Số thứ tự */}
                  <div className={styles.queueColumn}>
                    <div className={styles.queueBadge}>{appointment.queue_number}</div>
                  </div>

                  {/* Cột phải: Thông tin */}
                  <div className={styles.appointmentMain}>
                    
                    {/* Header: Tên BN, Bác sĩ & Giờ khám */}
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.appointmentName}>{appointment.patient.full_name}</h3>
                        {/* Đã tách tên bác sĩ xuống, thêm icon và căn lề */}
                        <div className={styles.doctorInfo}>
                          <Stethoscope size={16} />
                          <span>BS phụ trách: <strong>{appointment.doctor_name}</strong></span>
                        </div>
                      </div>
                      
                      <span className={styles.timeBadge}>
                        <Clock size={14} style={{ marginRight: '6px' }} />
                        {appointment.scheduled_time}
                      </span>
                    </div>

                    {/* Lưới thông tin */}
                    <div className={styles.infoGridWrapper}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>SĐT:</span>
                        <span className={styles.infoValue}>{appointment.patient.phone_number}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Ngày sinh:</span>
                        <span className={styles.infoValue}>{formatDate(appointment.patient.date_of_birth) || "Chưa cập nhật"}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Quê quán:</span>
                        <span className={styles.infoValue}>{appointment.patient.hometown || "Chưa cập nhật"}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>CCCD:</span>
                        <span className={styles.infoValue}>{appointment.patient.national_id || "Chưa cập nhật"}</span>
                      </div>
                    </div>

                    {/* Hộp triệu chứng */}
                    <div className={styles.reasonBox}>
                      <span className={styles.reasonLabel}>Triệu chứng:</span>
                      <span className={styles.reasonText}>{appointment.symptoms || "Chưa cập nhật"}</span>
                    </div>

                    {/* Footer: BHYT và Nút bấm */}
                    <div className={styles.cardFooter}>
                      <div>
                        {!!appointment.patient.insurance_number && (
                          <span className={styles.insuranceBadge}>BHYT: {appointment.patient.insurance_number}</span>
                        )}
                      </div>
                      <button 
                        className={`${styles.button} ${styles.primary} ${styles.examBtn}`} 
                        onClick={() => void handleStartExam(appointment)} 
                        disabled={saving}
                      >
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

                {!!appointment.service_items?.length && (
                  <div className={styles.noteBlue}>
                    <div className={styles.flexBetween}>
                      <p className={styles.textSmall}><strong>Dịch vụ bổ sung</strong></p>
                      <p className={styles.textSmall}><strong>Tổng: {appointment.total_service_cost?.toLocaleString("vi-VN")}đ</strong></p>
                    </div>
                    <div className={styles.rowStack}>
                      {appointment.service_items.map((item) => (
                        <div key={item.service_id} className={styles.itemCard}>
                          <div className={styles.flexBetween}>
                            <span className={styles.textSmall}>{item.service_name}</span>
                            <span className={styles.textSmall}>{(item.actual_price * item.quantity).toLocaleString("vi-VN")}đ</span>
                          </div>
                          <p className={styles.textSmall}>Số lượng: {item.quantity} - Đơn giá: {item.actual_price.toLocaleString("vi-VN")}đ</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!!appointment.total_exam_cost && (
                  <div className={styles.summaryCard}>
                    <p className={styles.textSmall}><strong>Tổng chi phí (thuốc + dịch vụ): {appointment.total_exam_cost.toLocaleString("vi-VN")}đ</strong></p>
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

                <div className={styles.panelBorder}>
                  <div className={`${styles.flexBetween} ${styles.mb2}`}>
                    <h4 className={styles.titleSmall}>Hồ sơ bệnh án cũ của bệnh nhân</h4>
                    <span className={styles.textSmall}>Đối chiếu tiền sử khám</span>
                  </div>

                  {historyLoading && <p className={styles.textSmall}>Đang tải lịch sử bệnh án...</p>}

                  {!historyLoading && historyRows.length === 0 && (
                    <p className={styles.textSmall}>Bệnh nhân chưa có hồ sơ khám cũ tại phòng khám.</p>
                  )}

                  {!historyLoading && historyRows.length > 0 && (
                    <div className={styles.rowStack}>
                      {historyRows.map((row) => (
                        <div key={row.medicalRecordId} className={styles.itemCard}>
                          <div className={styles.flexBetween}>
                            <div>
                              <p className={styles.textSmall}><strong>Ngày khám:</strong> {formatDate(row.appointmentTime)}</p>
                              <p className={styles.textSmall}><strong>Chẩn đoán cũ:</strong> {row.oldDiagnosis || "-"}</p>
                            </div>
                            <button
                              type="button"
                              className={`${styles.button} ${styles.outline}`}
                              onClick={() => selectedAppointment && void handleViewHistoryDetail(selectedAppointment.id, row.medicalRecordId)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {historyDetailLoading && <p className={styles.textSmall}>Đang tải chi tiết hồ sơ...</p>}

                  {historyDetail && (
                    <div className={`${styles.panelMuted} ${styles.mb2}`}>
                      <p className={styles.textSmall}><strong>Chẩn đoán:</strong> {historyDetail.diagnosis || "-"}</p>
                      <p className={styles.textSmall}><strong>Lời dặn:</strong> {historyDetail.doctorAdvice || "-"}</p>

                      <div className={styles.mb2}>
                        <p className={styles.textSmall}><strong>Thuốc đã kê:</strong></p>
                        {historyDetail.prescriptions.length > 0 ? (
                          <div className={styles.rowStack}>
                            {historyDetail.prescriptions.map((item) => (
                              <div key={item.medicineId} className={styles.itemCard}>
                                <p className={styles.textSmall}>{item.medicineName} - SL: {item.quantity}</p>
                                <p className={styles.textSmall}>{item.usageInstructions || "-"}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.textSmall}>Không có thuốc.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.panelBorder}>
                  <div className={`${styles.flexBetween} ${styles.mb2}`}>
                    <h4 className={styles.titleSmall}>Dịch vụ bổ sung trong phòng khám</h4>
                    <span className={styles.textSmall}>Tổng dịch vụ: {getTotalServiceCost().toLocaleString("vi-VN")}đ</span>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className={`${styles.rowStack} ${styles.mb2}`}>
                      {selectedServices.map((item) => (
                        <div key={item.service_id} className={styles.itemCard}>
                          <div className={`${styles.flexBetween} ${styles.mb1}`}>
                            <span className={styles.titleSmall}>{item.service_name}</span>
                            <span>{(item.actual_price * item.quantity).toLocaleString("vi-VN")}đ</span>
                          </div>

                          <div className={`${styles.grid2} ${styles.mb1}`}>
                            <div>
                              <label className={`${styles.textSmall} ${styles.textMuted}`}>Số lượng</label>
                              <input
                                type="number"
                                className={`${styles.input} ${styles.compactInput}`}
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateSelectedService(item.service_id, "quantity", parseInt(e.target.value, 10) || 1)}
                              />
                            </div>
                            <div>
                              <label className={`${styles.textSmall} ${styles.textMuted}`}>Đơn giá thực tế (VNĐ)</label>
                              <input
                                type="number"
                                className={`${styles.input} ${styles.compactInput}`}
                                min="1"
                                value={item.actual_price}
                                onChange={(e) => handleUpdateSelectedService(item.service_id, "actual_price", parseInt(e.target.value, 10) || 0)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={`${styles.textSmall} ${styles.textMuted}`}>Ghi chú dịch vụ</label>
                            <input
                              className={`${styles.input} ${styles.compactInput}`}
                              placeholder="VD: Chuyển phòng X-quang"
                              value={item.result_note || ""}
                              onChange={(e) => handleUpdateSelectedService(item.service_id, "result_note", e.target.value)}
                            />
                          </div>

                          <button
                            className={`${styles.button} ${styles.outline} ${styles.fullButton} ${styles.textDanger}`}
                            onClick={() => handleRemoveService(item.service_id)}
                          >
                            Xóa dịch vụ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.serviceGrid}>
                    {availableServices.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        className={styles.serviceItem}
                        onClick={() => handleAddService(service)}
                      >
                        <p className={`${styles.textMedium} ${styles.textSmall}`}>{service.serviceName}</p>
                        <p className={`${styles.textSmall} ${styles.textMuted}`}>{Number(service.currentPrice || 0).toLocaleString("vi-VN")}đ</p>
                      </button>
                    ))}
                  </div>

                  {availableServices.length === 0 && (
                    <p className={styles.textSmall}>Chưa có dịch vụ active trong hệ thống.</p>
                  )}
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
                      {medicineCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`${styles.categoryTab} ${activeMedicineCategory === category ? styles.categoryTabActive : ""}`}
                          onClick={() => setActiveMedicineCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <div className={styles.medicineGrid}>
                      {filteredMedicines.map((medicine) => (
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

                <div className={styles.summaryCard}>
                  <p className={styles.textSmall}>Tiền thuốc: {getTotalMedicineCost().toLocaleString("vi-VN")}đ</p>
                  <p className={styles.textSmall}>Tiền dịch vụ: {getTotalServiceCost().toLocaleString("vi-VN")}đ</p>
                  <p className={styles.textSmall}><strong>Tổng tạm tính: {getGrandTotalCost().toLocaleString("vi-VN")}đ</strong></p>
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