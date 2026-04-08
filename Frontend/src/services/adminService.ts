import { api } from "./api";

export type AdminRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "CASHIER" | "PATIENT";

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminRoom {
  id: number;
  roomName: string;
  currentDoctorId: number | null;
  currentDoctorUsername: string | null;
}

export interface AdminMedicine {
  id: number;
  medicineName: string;
  medicineType: string;
  unit: string | null;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface AdminMedicalService {
  id: number;
  serviceName: string;
  currentPrice: number;
  isActive: boolean;
}

export interface AdminDashboardData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicalRecords: number;
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  thisMonthAppointments: number;
}

export const adminService = {
  async getDashboard() {
    const response = await api.get<AdminDashboardData>("/api/admin/dashboard");
    return response.data;
  },

  async getUsers() {
    const response = await api.get<AdminUser[]>("/api/admin/users");
    return response.data;
  },

  async createUser(payload: {
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: AdminRole;
    isActive?: boolean;
  }) {
    const response = await api.post<AdminUser>("/api/admin/users", payload);
    return response.data;
  },

  async updateUser(
    userId: number,
    payload: {
      username?: string;
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
      role?: AdminRole;
      isActive?: boolean;
    },
  ) {
    const response = await api.put<AdminUser>(`/api/admin/users/${userId}`, payload);
    return response.data;
  },

  async deleteUser(userId: number) {
    await api.delete(`/api/admin/users/${userId}`);
  },

  async getRooms() {
    const response = await api.get<AdminRoom[]>("/api/admin/rooms");
    return response.data;
  },

  async createRoom(roomName: string) {
    const response = await api.post<AdminRoom>("/api/admin/rooms", { roomName });
    return response.data;
  },

  async updateRoom(roomId: number, roomName: string) {
    const response = await api.put<AdminRoom>(`/api/admin/rooms/${roomId}`, { roomName });
    return response.data;
  },

  async assignDoctorToRoom(roomId: number, doctorId: number) {
    const response = await api.put<AdminRoom>(`/api/admin/rooms/${roomId}/assign-doctor`, { doctorId });
    return response.data;
  },

  async getMedicines() {
    const response = await api.get<AdminMedicine[]>("/api/admin/medicines");
    return response.data;
  },

  async createMedicine(payload: {
    medicineName: string;
    medicineType: string;
    unit?: string;
    sellingPrice: number;
    stockQuantity: number;
    isActive?: boolean;
  }) {
    const response = await api.post<AdminMedicine>("/api/admin/medicines", payload);
    return response.data;
  },

  async updateMedicine(
    medicineId: number,
    payload: {
      medicineName?: string;
      medicineType?: string;
      unit?: string;
      sellingPrice?: number;
      stockQuantity?: number;
      isActive?: boolean;
    },
  ) {
    const response = await api.put<AdminMedicine>(`/api/admin/medicines/${medicineId}`, payload);
    return response.data;
  },

  async deactivateMedicine(medicineId: number) {
    await api.delete(`/api/admin/medicines/${medicineId}`);
  },

  async getMedicalServices() {
    const response = await api.get<AdminMedicalService[]>("/api/admin/services");
    return response.data;
  },

  async createMedicalService(payload: { serviceName: string; currentPrice: number; isActive?: boolean }) {
    const response = await api.post<AdminMedicalService>("/api/admin/services", payload);
    return response.data;
  },

  async updateMedicalServicePrice(serviceId: number, currentPrice: number) {
    const response = await api.put<AdminMedicalService>(`/api/admin/services/${serviceId}/price`, { currentPrice });
    return response.data;
  },

  async deactivateMedicalService(serviceId: number) {
    await api.delete(`/api/admin/services/${serviceId}`);
  },
};
