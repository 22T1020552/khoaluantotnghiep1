import { api } from "./api";

export interface ReceptionistPatient {
  id: number;
  fullName: string;
  gender?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
}

export interface ReceptionistDoctor {
  id: number;
  username: string;
}

export interface ReceptionistAppointment {
  id: number;
  appointmentTime: string;
  symptoms?: string | null;
  status: string;
  cancellationReason?: string | null;
  patient: ReceptionistPatient;
  doctor?: ReceptionistDoctor | null;
}

export interface ReceptionistDoctorOption {
  doctorId: number;
  doctorUsername: string;
  specialty?: string | null;
  roomName?: string | null;
}

export const receptionistService = {
  async getPendingAppointments() {
    const response = await api.get<ReceptionistAppointment[]>("/api/receptionist/appointments/from-booking");
    return response.data;
  },

  async getConfirmedAppointments() {
    const response = await api.get<ReceptionistAppointment[]>("/api/receptionist/appointments/waiting", {
      params: { status: "WAITING" },
    });
    return response.data;
  },

  async getCancelledAppointments() {
    const response = await api.get<ReceptionistAppointment[]>("/api/receptionist/appointments/waiting", {
      params: { status: "CANCELLED" },
    });
    return response.data;
  },

  async getDoctors() {
    const response = await api.get<ReceptionistDoctorOption[]>("/api/receptionist/doctors/by-specialty");
    const doctorsInRooms = response.data.filter((doctor) => Boolean(doctor.roomName && doctor.roomName.trim()));

    const uniqueByDoctor = new Map<number, ReceptionistDoctorOption>();
    doctorsInRooms.forEach((doctor) => {
      if (!uniqueByDoctor.has(doctor.doctorId)) {
        uniqueByDoctor.set(doctor.doctorId, doctor);
      }
    });

    return [...uniqueByDoctor.values()].sort((a, b) => {
      const roomCompare = (a.roomName ?? '').localeCompare(b.roomName ?? '', 'vi');
      if (roomCompare !== 0) {
        return roomCompare;
      }
      return a.doctorUsername.localeCompare(b.doctorUsername, 'vi');
    });
  },

  async approveAppointment(appointmentId: number, doctorId: number, appointmentTime: string) {
    const response = await api.put<ReceptionistAppointment>(`/api/receptionist/appointments/${appointmentId}/approve`, {
      doctorId,
      appointmentTime,
    });
    return response.data;
  },

  async cancelAppointment(appointmentId: number, cancellationReason: string) {
    const response = await api.put<ReceptionistAppointment>(`/api/receptionist/appointments/${appointmentId}/cancel`, {
      cancellationReason: cancellationReason.trim(),
      requireReason: true,
    });
    return response.data;
  },
};
