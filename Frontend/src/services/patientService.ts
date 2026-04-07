import { api } from "./api";

export interface PatientProfileResponse {
  patientId: number;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  healthInsuranceNumber: string;
  gmail: string;
}

export interface PatientAppointmentRequestPayload {
  appointmentTime: string;
  symptoms: string;
}

export interface PatientAppointmentResponse {
  id: number;
  appointmentTime: string;
  symptoms: string;
  status: string;
  doctor?: {
    id: number;
    username?: string;
    fullName?: string;
  } | null;
}

export interface PatientMedicalRecordHistoryItemResponse {
  medicalRecordId: number;
  appointmentId: number | null;
  appointmentTime: string | null;
  appointmentStatus: string | null;
  doctorUsername: string | null;
  diagnosis: string | null;
  doctorAdvice: string | null;
  createdAt: string | null;
  prescriptionItemCount: number;
}

export interface PatientPrescriptionHistoryItemResponse {
  medicineId: number | null;
  medicineName: string | null;
  unit: string | null;
  quantity: number | null;
  usageInstructions: string | null;
  unitPrice: number;
  totalPrice: number;
}

export interface PatientMedicalRecordDetailResponse {
  medicalRecordId: number;
  appointmentId: number | null;
  appointmentTime: string | null;
  appointmentStatus: string | null;
  doctorUsername: string | null;
  diagnosis: string | null;
  doctorAdvice: string | null;
  createdAt: string | null;
  prescriptionItems: PatientPrescriptionHistoryItemResponse[];
}

export const patientService = {
  async getProfile() {
    const response = await api.get<PatientProfileResponse>("/api/patient/profile");
    return response.data;
  },

  async createAppointment(payload: PatientAppointmentRequestPayload) {
    const response = await api.post<PatientAppointmentResponse>("/api/patient/appointments", payload);
    return response.data;
  },

  async getMyAppointments() {
    const response = await api.get<PatientAppointmentResponse[]>("/api/patient/appointments");
    return response.data;
  },

  async cancelMyAppointment(appointmentId: number) {
    const response = await api.put<PatientAppointmentResponse>(`/api/patient/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  async getMedicalRecordHistory() {
    const response = await api.get<PatientMedicalRecordHistoryItemResponse[]>("/api/patient/medical-records");
    return response.data;
  },

  async getMedicalRecordDetail(medicalRecordId: number) {
    const response = await api.get<PatientMedicalRecordDetailResponse>(`/api/patient/medical-records/${medicalRecordId}`);
    return response.data;
  },
};
