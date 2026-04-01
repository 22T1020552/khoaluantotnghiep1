export interface PrescriptionItem {
  medicationId: string;
  medicationName: string;
  dosage: string;
  unit: string;
  quantity: number;
  price: number;
  usage: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  phone: string;
  insuranceNumber: string;
  doctor: string;
  diagnosis: string;
  treatment: string;
  prescriptionItems: PrescriptionItem[];
  totalMedicationCost: number;
  date: string;
  status: "pending" | "dispensed";
  serviceFee?: number;
  insuranceDiscount?: number;
  totalAmount?: number;
}