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

export interface AdminRoomSchedule {
  id: number;
  roomId: number;
  roomName: string;
  doctorId: number;
  doctorUsername: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  timeSlot: string;
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

export interface AdminRevenueChartPoint {
  period: string;
  revenue: number;
}

export interface AdminRevenueReportItem {
  invoiceId: number;
  appointmentId: number | null;
  patientName: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  totalServiceFee: number;
  totalMedicineFee: number;
  grandTotal: number;
  services: string[];
  medicines: string[];
}

export interface AdminRevenueReportResponse {
  startTime: string;
  endTime: string;
  groupBy: string;
  serviceFilter: string | null;
  medicineFilter: string | null;
  totalInvoices: number;
  totalRevenue: number;
  totalServiceRevenue: number;
  totalMedicineRevenue: number;
  items: AdminRevenueReportItem[];
  chart: AdminRevenueChartPoint[];
  message: string;
}

export interface AdminSystemSetting {
  settingKey: string;
  settingValue: string;
  description: string;
  source: "DATABASE" | "APPLICATION_PROPERTIES" | "EMPTY";
}

export const adminService = {
  async getDashboard() {
    const response = await api.get<AdminDashboardData>("/api/admin/dashboard");
    return response.data;
  },

  async getRevenueReport(params?: {
    startTime?: string;
    endTime?: string;
    serviceFilter?: string;
    medicineFilter?: string;
    groupBy?: "DAY" | "MONTH" | "YEAR";
  }) {
    const response = await api.get<AdminRevenueReportResponse>("/api/admin/revenue-report", {
      params,
    });
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

  async getRoomSchedules(params: { month: string }) {
    const response = await api.get<AdminRoomSchedule[]>("/api/admin/room-schedules", { params });
    return response.data;
  },

  async createRoomSchedule(payload: {
    roomId: number;
    doctorId: number;
    scheduleDate: string;
    timeSlot: string;
  }) {
    const response = await api.post<AdminRoomSchedule>("/api/admin/room-schedules", payload);
    return response.data;
  },

  async updateRoomSchedule(
    scheduleId: number,
    payload: {
      roomId: number;
      doctorId: number;
      scheduleDate: string;
      timeSlot: string;
    },
  ) {
    const response = await api.put<AdminRoomSchedule>(`/api/admin/room-schedules/${scheduleId}`, payload);
    return response.data;
  },

  async deleteRoomSchedule(scheduleId: number) {
    await api.delete(`/api/admin/room-schedules/${scheduleId}`);
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

  async getSettings() {
    const response = await api.get<AdminSystemSetting[]>("/api/admin/settings");
    return response.data;
  },

  async getSetting(settingKey: string) {
    const encodedKey = encodeURIComponent(settingKey);
    const response = await api.get<AdminSystemSetting>(`/api/admin/settings/${encodedKey}`);
    return response.data;
  },

  async updateSetting(settingKey: string, settingValue: string, description?: string) {
    const encodedKey = encodeURIComponent(settingKey);
    const response = await api.put<AdminSystemSetting>(`/api/admin/settings/${encodedKey}`, {
      settingValue,
      description,
    });
    return response.data;
  },
};
