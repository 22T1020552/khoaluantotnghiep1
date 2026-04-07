'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { DashboardStats } from "./components/dashboard-stats";
import { PendingAppointments } from "./components/pending-appointment";
import { ConfirmedAppointments } from "./components/confirm-appointment";
import { ConfirmModal } from "./components/confirm-modal";
import { useReceptionistDashboard } from "@/hooks/useReceptionistDashboard";
import { getApiErrorMessage } from "@/services/api";
import { receptionistService, type ReceptionistAppointment } from "@/services/receptionistService";
import styles from "@/styles/common.module.css";

interface ReceptionistDashboardProps {
  routeView?: "all" | "pending" | "confirmed";
}

export function ReceptionistDashboard({ routeView = "all" }: ReceptionistDashboardProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<ReceptionistAppointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    pendingAppointments,
    confirmedAppointments,
    doctorOptions,
    totalCount,
    isLoading,
    loadDashboardData,
  } = useReceptionistDashboard();

  const resolveRoomName = (doctorId?: number) => {
    if (!doctorId) {
      return "Chưa có";
    }

    const matched = doctorOptions.find((doctor) => doctor.doctorId === doctorId);
    return matched?.roomName || "Chưa có";
  };

  useEffect(() => {
    loadDashboardData().catch((error) => {
      toast.error(getApiErrorMessage(error, "Không thể tải dữ liệu lễ tân"));
    });
  }, [loadDashboardData]);

  // Xử lý khi Lễ tân bấm nút "Xác nhận" trên thẻ lịch hẹn
  const handleOpenConfirmModal = (appointment: ReceptionistAppointment) => {
    setSelectedAppointment(appointment);
  };

  // Xử lý khi Lễ tân submit form trong Modal
  const toApiDateTime = (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      return normalized;
    }

    if (normalized.length === 16) {
      return `${normalized}:00`;
    }

    return normalized;
  };

  const handleConfirmAppointment = async (doctorId: number, appointmentTime: string) => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setIsSubmitting(true);
      await receptionistService.approveAppointment(
        selectedAppointment.id,
        doctorId,
        toApiDateTime(appointmentTime),
      );
      toast.success("Xác nhận lịch hẹn thành công");
      setSelectedAppointment(null);
      await loadDashboardData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể xác nhận lịch hẹn"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý khi Lễ tân bấm Hủy
  const handleCancelAppointment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      await receptionistService.cancelAppointment(id, "Hủy bởi lễ tân");
      toast.success("Đã hủy lịch hẹn");
      await loadDashboardData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể hủy lịch hẹn"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Tiếp nhận bệnh nhân - Lễ tân</h1>
            <p>Quản lý lịch hẹn và phân công bác sĩ khám</p>
          </div>

          <DashboardStats 
            pendingCount={pendingAppointments.length} 
            confirmedCount={confirmedAppointments.length} 
            totalCount={totalCount} 
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

          {isLoading && (
            <div className={styles.card}>
              <div className={styles.textCenter} style={{ padding: "2rem", color: "#64748b" }}>
                Đang tải dữ liệu lịch hẹn...
              </div>
            </div>
          )}

          {!isLoading && routeView !== "confirmed" && (
            <PendingAppointments 
              appointments={pendingAppointments} 
              onConfirmClick={handleOpenConfirmModal} 
              onCancelClick={handleCancelAppointment} 
              disabled={isSubmitting}
            />
          )}

          {!isLoading && routeView !== "pending" && (
            <ConfirmedAppointments 
              appointments={confirmedAppointments} 
              resolveRoomName={resolveRoomName}
            />
          )}
        </div>
      </main>

      {selectedAppointment && (
        <ConfirmModal
          appointment={selectedAppointment}
          doctors={doctorOptions}
          onClose={() => setSelectedAppointment(null)}
          onConfirm={handleConfirmAppointment}
          submitting={isSubmitting}
        />
      )}
    </>
  );
}