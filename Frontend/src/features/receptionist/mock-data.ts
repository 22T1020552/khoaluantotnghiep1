import type { Appointment } from "@/types/appointment.type";
import type { Patient, User } from "@/types/user.type";

export type AppointmentWithDetails = Appointment & { patient: Patient; doctor?: User };

export const mockDoctors: User[] = [
  { id: 2, username: "nguyen-van-hung", password: "", role: "doctor", is_active: true },
  { id: 3, username: "tran-thi-mai", password: "", role: "doctor", is_active: true },
  { id: 4, username: "le-thi-lan", password: "", role: "doctor", is_active: true },
];

const patients: Patient[] = [
  {
    id: 101,
    user_id: 11,
    full_name: "Pham Thi Dung",
    gender: "female",
    national_id: "001095012345",
    phone_number: "0945678901",
  },
  {
    id: 102,
    user_id: 12,
    full_name: "Nguyen Van An",
    gender: "male",
    national_id: "001085012345",
    phone_number: "0912345678",
  },
  {
    id: 103,
    user_id: 13,
    full_name: "Le Minh Cuong",
    gender: "male",
    national_id: "001078012345",
    phone_number: "0934567890",
  },
];

export const mockAppointments: AppointmentWithDetails[] = [
  {
    id: 1,
    patient_id: 101,
    doctor_id: 0,
    appointment_time: "2026-04-02T09:00:00",
    symptoms: "Kham thai 3 thang",
    status: "pending",
    patient: patients[0],
  },
  {
    id: 2,
    patient_id: 102,
    doctor_id: 0,
    appointment_time: "2026-04-02T10:30:00",
    symptoms: "Dau dau, chong mat, buon non",
    status: "pending",
    patient: patients[1],
  },
  {
    id: 3,
    patient_id: 103,
    doctor_id: 2,
    appointment_time: "2026-04-01T08:00:00",
    symptoms: "Ho, sot nhe, dau hong",
    status: "confirmed",
    patient: patients[2],
    doctor: mockDoctors[0],
  },
];
