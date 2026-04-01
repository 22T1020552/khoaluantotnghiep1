import { PatientInfo } from "./patient-info";
import { MedicalRecordForm } from "./medical-record-form";
import { PrescriptionSection } from "./prescription-section";
import type { Appointment, MedicalRecordInput, Medicine, PrescriptionItem } from "../types";
import styles from "@/styles/common.module.css";

interface ExaminationModalProps {
  appointment: Appointment;
  medicalRecord: MedicalRecordInput;
  prescriptions: PrescriptionItem[];
  availableMedicines: Medicine[];
  totalCost: number;
  onClose: () => void;
  onComplete: () => void;
  onMedicalRecordChange: (field: string, value: string) => void;
  onAddMedicine: (medicine: Medicine) => void;
  onUpdatePrescription: (
    id: number,
    field: "quantity" | "usage_instructions",
    value: number | string,
  ) => void;
  onRemoveMedicine: (id: number) => void;
}

export function ExaminationModal({
  appointment,
  medicalRecord,
  prescriptions,
  availableMedicines,
  totalCost,
  onClose,
  onComplete,
  onMedicalRecordChange,
  onAddMedicine,
  onUpdatePrescription,
  onRemoveMedicine,
}: ExaminationModalProps) {
  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.modalContentWide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Khám bệnh - {appointment.patient.full_name}</h2>
        </div>

        <div className={styles.sectionBlock}>
          <PatientInfo patient={appointment.patient} symptoms={appointment.symptoms} />
          
          <MedicalRecordForm 
            diagnosis={medicalRecord.diagnosis} 
            doctorAdvice={medicalRecord.doctor_advice} 
            onChange={onMedicalRecordChange} 
          />
          
          <PrescriptionSection 
            prescriptions={prescriptions}
            availableMedicines={availableMedicines}
            totalCost={totalCost}
            onAddMedicine={onAddMedicine}
            onUpdatePrescription={onUpdatePrescription}
            onRemoveMedicine={onRemoveMedicine}
          />
        </div>

        <div className={styles.actionRow}>
          <button className={`${styles.button} ${styles.primary} ${styles.actionButtonGrow}`} onClick={onComplete}>
            Hoàn thành khám
          </button>
          <button className={`${styles.button} ${styles.outline} ${styles.actionButtonGrow}`} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}