export interface CashierQueueItem {
  invoiceId: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  appointmentTime: string;
  grandTotal: number;
  advanceAmount: number;
  remainingAmount: number;
  invoiceStatus: string;
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
  appointmentId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  appointmentTime: string;
  invoiceStatus: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  totalServiceFee: number;
  grandTotal: number;
  advanceAmount: number;
  remainingAmount: number;
  services: CashierServiceLine[];
  medicines: CashierMedicineLine[];
}

export interface CashierPaidItem {
  invoiceId: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  paymentMethod: string;
  paidAt: string;
  grandTotal: number;
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
  serviceItems?: CashierServiceLine[];
  insuranceDiscount?: number;
  totalAmount?: number;
  invoiceId?: number;
  appointmentId?: number;
  grandTotal?: number;
  advanceAmount?: number;
  remainingAmount?: number;
  paymentMethod?: string;
}