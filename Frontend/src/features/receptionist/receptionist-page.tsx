'use client';

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { DashboardStats } from "./components/dashboard-stats";
import { PendingAppointments } from "./components/pending-appointment";
import { ConfirmedAppointments } from "./components/confirm-appointment";
import { ConfirmModal } from "./components/confirm-modal";
import { mockAppointments, mockDoctors } from "./mock-data";
import type { AppointmentWithDetails } from "./mock-data";
import styles from "@/styles/common.module.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReceptionistDashboardProps {
  routeView?: "all" | "pending" | "confirmed";
}

export function ReceptionistDashboard({ routeView = "all" }: ReceptionistDashboardProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);

  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed");

  // Xử lý khi Lễ tân bấm nút "Xác nhận" trên thẻ lịch hẹn
  const handleOpenConfirmModal = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
  };

  const handleLogout = () => {
    // TODO sau này: Xóa localStorage, cookies hoặc token ở đây
    // localStorage.removeItem('token');
    
    toast.success("Đăng xuất thành công");
    router.push("/"); // Chuyển hướng về trang chủ
  };
  // Xử lý khi Lễ tân submit form trong Modal
  const handleConfirmAppointment = (doctorId: number, time: string) => {
    setAppointments(
      appointments.map((a) => {
        if (a.id !== selectedAppointment?.id) {
          return a;
        }

        const assignedDoctor = mockDoctors.find((doctor) => doctor.id === doctorId);

        return {
          ...a,
          status: "confirmed" as const,
          doctor_id: doctorId,
          appointment_time: time,
          doctor: assignedDoctor,
        };
      }),
    );
    setSelectedAppointment(null);
  };

  // Xử lý khi Lễ tân bấm Hủy
  const handleCancelAppointment = (id: number) => {
    if (confirm("Bạn có chắc muốn hủy lịch hẹn này?")) {
      setAppointments(
        appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a))
      );
    }
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>+</div>
          <span className={styles.logoText}>MEDICARE</span>
        </div>

        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={20} /> Tổng quan
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
            <div>
              <div className={styles.userName}>Lễ tân trực</div>
              <div className={styles.userRole}>Quầy tiếp nhận</div>
            </div>
          </div>
          <button 
            className={`${styles.navItem} ${styles.logoutButton}`} 
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Tiếp nhận bệnh nhân - Lễ tân</h1>
            <p>Quản lý lịch hẹn và phân công bác sĩ khám</p>
          </div>

          <DashboardStats 
            pendingCount={pendingAppointments.length} 
            confirmedCount={confirmedAppointments.length} 
            totalCount={appointments.length} 
          />

          <div className={styles.flexRow}>
            <Link
              href="/receptionist"
              className={`${styles.button} ${routeView === "all" ? styles.primary : styles.outline}`}
            >
              Tất cả
            </Link>
            <Link
              href="/receptionist/pending"
              className={`${styles.button} ${routeView === "pending" ? styles.primary : styles.outline}`}
            >
              Chờ xác nhận
            </Link>
            <Link
              href="/receptionist/confirmed"
              className={`${styles.button} ${routeView === "confirmed" ? styles.primary : styles.outline}`}
            >
              Đã xác nhận
            </Link>
          </div>

          {routeView !== "confirmed" && (
            <PendingAppointments 
              appointments={pendingAppointments} 
              onConfirmClick={handleOpenConfirmModal} 
              onCancelClick={handleCancelAppointment} 
            />
          )}

          {routeView !== "pending" && (
            <ConfirmedAppointments 
              appointments={confirmedAppointments} 
            />
          )}
        </div>
      </main>

      {selectedAppointment && (
        <ConfirmModal
          appointment={selectedAppointment}
          doctors={mockDoctors}
          onClose={() => setSelectedAppointment(null)}
          onConfirm={handleConfirmAppointment}
        />
      )}
    </div>
  );
}