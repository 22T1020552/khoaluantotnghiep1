export type Gender = "male" | "female";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  phone_number: string;
  hometown: string;
  national_id: string;
  insurance_number: string;
  gender: Gender;
}

export interface Appointment {
  id: number;
  patient: Patient;
  doctor_name: string;
  symptoms: string;
  scheduled_date: string;
  scheduled_time: string;
  queue_number: number;
  appointment_time: string;
  status: AppointmentStatus;
  diagnosis?: string;
  doctor_advice?: string;
  prescription_items?: PrescriptionItem[];
  total_medicine_cost?: number;
}

export interface Medicine {
  id: number;
  medicine_name: string;
  dosage: string;
  category: string;
  unit: string;
  stock_quantity: number;
  selling_price: number;
}

export interface PrescriptionItem {
  medicine_id: number;
  quantity: number;
  usage_instructions: string;
  medicine: Medicine;
}

export interface MedicalRecordInput {
  diagnosis: string;
  doctor_advice: string;
}
