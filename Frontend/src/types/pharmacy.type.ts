export interface CashierQueueItem {
  invoiceId: number;
  medicalRecordId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  appointmentTime: string;
  totalAmount: number;
  paymentStatus: string;
}

export interface CashierServiceLine {
  serviceId: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CashierMedicineLine {
  medicineId: number;
  medicineName: string;
  quantity: number;
  usageInstructions: string;
  unitPrice: number;
  lineTotal: number;
}

export interface CashierPaymentDetail {
  invoiceId: number;
  medicalRecordId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  appointmentTime: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  totalServiceFee: number;
  totalMedicineFee: number;
  totalAmount: number;
  services: CashierServiceLine[];
  medicines: CashierMedicineLine[];
}

export interface CashierPaidItem {
  invoiceId: number;
  medicalRecordId: number;
  patientId: number;
  patientName: string;
  paymentMethod: string;
  paidAt: string;
  totalAmount: number;
}

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
<<<<<<< HEAD
=======
  serviceItems?: CashierServiceLine[];
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  insuranceDiscount?: number;
  totalAmount?: number;
  invoiceId?: number;
  medicalRecordId?: number;
  paymentMethod?: string;
}