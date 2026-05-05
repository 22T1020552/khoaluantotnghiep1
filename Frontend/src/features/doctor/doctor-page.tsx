'use client';

import { useEffect, useState } from "react";
import { Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/services/api";
import { doctorService, type DoctorMedicalService, type PrescriptionCatalogMedicine } from "@/services/doctorService";
import type { Appointment, MedicalRecordInput, Medicine, PrescriptionItem, SelectedServiceItem } from "@/types/doctor.type";
import styles from "@/styles/common.module.css";

// IMPORT COMPONENTS CON
import { DoctorStats } from "./components/doctor-stats";
import { WaitingList } from "./components/waiting-list";
import { CompletedList } from "./components/completed-list";
import { ExaminationModal } from "./components/examination-modal";

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
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
): Appointment => {
  const genderValue = item.patient.gender?.toUpperCase();
  let gender: "male" | "female" = "male";
  if (genderValue === "FEMALE" || genderValue === "NỮ") gender = "female";
  
  return {
    id: item.id,
    patient: {
      id: item.patient.id,
      full_name: item.patient.fullName || "Chưa cập nhật",
      date_of_birth: item.patient.dateOfBirth || "",
      phone_number: item.patient.phoneNumber || "",
      hometown: item.patient.hometown || "",
      national_id: item.patient.nationalId || "",
      insurance_number: item.patient.healthInsuranceNumber || "",
      gender,
    },
    doctor_name: item.doctor?.username || "BS phụ trách",
    symptoms: item.symptoms || "",
    scheduled_time: formatTime(item.appointmentTime),
    appointment_time: item.appointmentTime,
    queue_number: queueNumber,
    status,
  };
};

const isPastAppointmentDay = (value?: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  const appointmentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return appointmentDay < currentDay;
};

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
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  
  const [historyRows, setHistoryRows] = useState<Awaited<ReturnType<typeof doctorService.getPatientHistorySummary>>["histories"]>([]);
  const [historyDetail, setHistoryDetail] = useState<Awaited<ReturnType<typeof doctorService.getPatientHistoryDetail>> | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const waitingAppointments = appointments.filter(
    (a) => a.status === "confirmed" && !isPastAppointmentDay(a.appointment_time),
  );
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
      const waitingMapped: Appointment[] = waiting.map((item) => mapDoctorAppointmentToUi(item, queue++, "confirmed"));
      const completedMappedBase: Appointment[] = completed.map((item) => mapDoctorAppointmentToUi(item, 0, "completed"));

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
              medicine_id: line.medicineId, quantity: line.quantity, usage_instructions: line.usageInstructions,
              medicine: byId.get(line.medicineId) || ({ id: line.medicineId, medicine_name: line.medicineName, dosage: "", category: "Khác", unit: line.unit || "đv", stock_quantity: 0, selling_price: line.sellingPrice } as Medicine),
            }));

            const serviceItems: SelectedServiceItem[] = (detail?.services || []).map((service) => ({
              service_id: service.serviceId, service_name: service.serviceName, quantity: service.quantity, actual_price: service.actualPrice, result_note: service.resultNote || "",
            }));

            const totalServiceCost = serviceItems.reduce((sum, item) => sum + item.actual_price * item.quantity, 0);

            return {
              ...appointment,
              diagnosis: record.diagnosis || detail?.diagnosis || "",
              doctor_advice: record.doctorAdvice || detail?.doctorAdvice || "",
              prescription_items: prescriptionItems,
              service_items: serviceItems,
              total_medicine_cost: 0,
              total_service_cost: totalServiceCost,
              total_exam_cost: totalServiceCost,
            };
          } catch {
            return appointment;
          }
        })
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
      setAppointments((prev) => prev.map((item) => (item.id === appointment.id ? { ...item, status: "pending" } : item)));
      setSelectedAppointment(appointment);
      setIsExamining(true);
      setHistoryRows([]);
      setHistoryDetail(null);
      setMedicalRecord({ diagnosis: appointment.diagnosis ?? "", doctor_advice: appointment.doctor_advice ?? "" });
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
        setMedicalRecord({ diagnosis: record.diagnosis || "", doctor_advice: record.doctorAdvice || "" });

        const workspace = await doctorService.getPrescriptionWorkspace(record.id);
        const mappedMeds = (workspace.medicineCatalog || []).map(mapCatalogToMedicine);
        const byId = new Map<number, Medicine>(mappedMeds.map((m) => [m.id, m]));
        setAvailableMedicines(mappedMeds);
        setPrescriptions((workspace.prescribedMedicines || []).map((line) => ({
          medicine_id: line.medicineId, quantity: line.quantity, usage_instructions: line.usageInstructions,
          medicine: byId.get(line.medicineId) || ({ id: line.medicineId, medicine_name: line.medicineName, dosage: "", category: "Khác", unit: line.unit || "đv", stock_quantity: 0, selling_price: line.sellingPrice } as Medicine),
        })));

        const recordDetail = await doctorService.getPatientHistoryDetail(appointment.id, record.id).catch(() => null);
        setSelectedServices((recordDetail?.services || []).map((service) => ({
          service_id: service.serviceId, service_name: service.serviceName, quantity: service.quantity, actual_price: service.actualPrice, result_note: service.resultNote || "",
        })));
      } else {
        setMedicalRecordId(null);
        setSelectedServices([]);
        const medicines = await doctorService.getAvailableMedicines();
        setAvailableMedicines(medicines.filter((item) => item.isActive).map((item) => ({
          id: item.id, medicine_name: item.medicineName, dosage: "", category: item.medicineType || "Khác", unit: item.unit || "đv", stock_quantity: item.stockQuantity, selling_price: item.sellingPrice,
        })));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể mở ca khám"));
      setIsExamining(false);
    } finally {
      setSaving(false);
    }
  };

  const handleMedicalRecordChange = (field: string, value: string) => setMedicalRecord((prev) => ({ ...prev, [field]: value }));

  const handleAddMedicine = async (medicine: Medicine) => {
    if (prescriptions.find((p) => p.medicine_id === medicine.id)) return toast.error("Thuốc này đã được thêm vào đơn");
    if (medicalRecordId) {
      try { await doctorService.addPrescriptionDetail(medicalRecordId, { medicineId: medicine.id, quantity: 1, usageInstructions: "" }); } catch { }
    }
    setPrescriptions((prev) => [...prev, { medicine_id: medicine.id, quantity: 1, usage_instructions: "", medicine }]);
  };

  const handleUpdatePrescription = (medicineId: number, field: "quantity" | "usage_instructions", value: number | string) => {
    setPrescriptions((prev) => prev.map((p) => p.medicine_id === medicineId ? { ...p, [field]: value } : p));
  };

  const handleRemoveMedicine = async (medicineId: number) => {
    if (medicalRecordId) {
      try { await doctorService.removePrescriptionDetail(medicalRecordId, medicineId); } catch { }
    }
    setPrescriptions((prev) => prev.filter((p) => p.medicine_id !== medicineId));
  };

  const handleAddService = (service: DoctorMedicalService) => {
    if (selectedServices.find((item) => item.service_id === service.id)) return toast.error("Dịch vụ này đã được thêm");
    setSelectedServices((prev) => [...prev, { service_id: service.id, service_name: service.serviceName, quantity: 1, actual_price: Number(service.currentPrice || 0), result_note: "" }]);
  };

  const handleUpdateSelectedService = (serviceId: number, field: "quantity" | "actual_price" | "result_note", value: number | string) => {
    setSelectedServices((prev) => prev.map((item) => (item.service_id === serviceId ? { ...item, [field]: value } : item)));
  };

  const handleRemoveService = (serviceId: number) => setSelectedServices((prev) => prev.filter((item) => item.service_id !== serviceId));

  const getTotalServiceCost = () => selectedServices.reduce((sum, item) => sum + item.actual_price * item.quantity, 0);

  const handleCompleteExam = async () => {
    if (!selectedAppointment) return;
    if (!medicalRecord.diagnosis || !medicalRecord.doctor_advice) return toast.error("Vui lòng điền đầy đủ chẩn đoán và hướng dẫn điều trị");
    if (prescriptions.length > 0 && prescriptions.some((p) => !p.usage_instructions.trim())) return toast.error("Vui lòng nhập hướng dẫn sử dụng cho tất cả thuốc");
    if (selectedServices.some((item) => item.quantity < 1 || item.actual_price <= 0)) return toast.error("Số lượng dịch vụ phải >= 1 và đơn giá phải > 0");

    try {
      setSaving(true);
      let recordId = medicalRecordId;
      if (!recordId) {
        const created = await doctorService.createMedicalRecord({ appointmentId: selectedAppointment.id, diagnosis: medicalRecord.diagnosis, doctorAdvice: medicalRecord.doctor_advice });
        recordId = created.id;
        setMedicalRecordId(recordId);
      }
      if (!recordId) throw new Error("Không tạo được bệnh án");

      for (const item of prescriptions) {
        try { await doctorService.updatePrescriptionDetail(recordId, item.medicine_id, { quantity: item.quantity, usageInstructions: item.usage_instructions }); } 
        catch { await doctorService.addPrescriptionDetail(recordId, { medicineId: item.medicine_id, quantity: item.quantity, usageInstructions: item.usage_instructions }); }
      }

      for (const service of selectedServices) {
        await doctorService.upsertMedicalRecordServiceResult(recordId, { serviceId: service.service_id, quantity: service.quantity, actualPrice: service.actual_price, resultNote: service.result_note?.trim() || undefined });
      }

      if (prescriptions.length > 0) await doctorService.savePrescription(recordId);
      await doctorService.completeMedicalRecord(recordId);

      setAppointments((prev) => prev.map((a) => a.id === selectedAppointment.id ? { ...a, status: "completed" as const, diagnosis: medicalRecord.diagnosis, doctor_advice: medicalRecord.doctor_advice, prescription_items: prescriptions, service_items: selectedServices, total_medicine_cost: 0, total_service_cost: getTotalServiceCost(), total_exam_cost: getTotalServiceCost() } : a));
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
    if (selectedAppointment) setAppointments((prev) => prev.map((item) => item.id === selectedAppointment.id && item.status === "pending" ? { ...item, status: "confirmed" } : item));
    setIsExamining(false); setSelectedAppointment(null); setMedicalRecordId(null);
    setMedicalRecord({ diagnosis: "", doctor_advice: "" }); setPrescriptions([]); setSelectedServices([]);
    setHistoryRows([]); setHistoryDetail(null); setHistoryLoading(false); setHistoryDetailLoading(false);
  };

  const handleViewHistoryDetail = async (historyMedicalRecordId: number) => {
    if (!selectedAppointment) return;
    try {
      setHistoryDetailLoading(true);
      const detail = await doctorService.getPatientHistoryDetail(selectedAppointment.id, historyMedicalRecordId);
      setHistoryDetail(detail);
    } catch (error) { toast.error(getApiErrorMessage(error, "Không thể tải chi tiết hồ sơ cũ")); } 
    finally { setHistoryDetailLoading(false); }
  };

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Bàn khám bệnh - Bác sĩ</h1>
          <p>Quản lý hàng đợi, khám bệnh và kê đơn thuốc theo ca.</p>
        </div>

        {/* Component 1 */}
        <DoctorStats 
          waitingCount={waitingAppointments.length} 
          examiningCount={examiningAppointments.length} 
          completedCount={completedAppointments.length} 
        />

        <div className={styles.tabRow}>
          <button type="button" className={`${styles.tabButton} ${activeTab === "waiting" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("waiting")}>
            <Users size={16} /> Hàng đợi ({waitingAppointments.length})
          </button>
          <button type="button" className={`${styles.tabButton} ${activeTab === "completed" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("completed")}>
            <CheckCircle size={16} /> Đã khám ({completedAppointments.length})
          </button>
        </div>

        {loading && <div className={styles.emptyBox}>Đang tải dữ liệu...</div>}

        {/* Component 2 */}
        {!loading && activeTab === "waiting" && (
          <WaitingList 
            appointments={waitingAppointments} 
            saving={saving} 
            onStartExam={handleStartExam} 
          />
        )}

        {/* Component 3 */}
        {!loading && activeTab === "completed" && (
          <CompletedList appointments={completedAppointments} />
        )}

        {/* Component 4 (Vỏ bọc gọi Component của bạn) */}
        {isExamining && selectedAppointment && (
          <ExaminationModal 
            appointment={selectedAppointment}
            saving={saving}
            medicalRecord={medicalRecord}
            prescriptions={prescriptions}
            availableMedicines={availableMedicines}
            availableServices={availableServices}
            selectedServices={selectedServices}
            historyRows={historyRows}
            historyDetail={historyDetail}
            historyLoading={historyLoading}
            historyDetailLoading={historyDetailLoading}
            totalServiceCost={getTotalServiceCost()}
            onClose={handleCloseExam}
            onComplete={handleCompleteExam}
            onMedicalRecordChange={handleMedicalRecordChange}
            onAddMedicine={handleAddMedicine}
            onUpdatePrescription={handleUpdatePrescription}
            onRemoveMedicine={handleRemoveMedicine}
            onAddService={handleAddService}
            onUpdateService={handleUpdateSelectedService}
            onRemoveService={handleRemoveService}
            onViewHistoryDetail={handleViewHistoryDetail}
          />
        )}
      </div>
    </main>
  );
}