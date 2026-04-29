'use client';

import { useEffect, useState } from "react";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
import { toast } from "sonner";

import { DashboardStats } from "./components/dashboard-stats";
import { PendingAppointments } from "./components/pending-appointment";
import { ConfirmedAppointments } from "./components/confirm-appointment";
<<<<<<< HEAD
=======
import { CancelledAppointments } from "./components/cancelled-appointment";
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
import { ConfirmModal } from "./components/confirm-modal";
import { useReceptionistDashboard } from "@/hooks/useReceptionistDashboard";
import { getApiErrorMessage } from "@/services/api";
import { receptionistService, type ReceptionistAppointment } from "@/services/receptionistService";
import styles from "@/styles/common.module.css";

<<<<<<< HEAD
interface ReceptionistDashboardProps {
  routeView?: "all" | "pending" | "confirmed";
}

export function ReceptionistDashboard({ routeView = "all" }: ReceptionistDashboardProps) {
=======
export function ReceptionistDashboard() {
  // Thành phần chính của lễ tân: hiển thị lịch hẹn chờ xác nhận/đã xác nhận và thao tác duyệt/hủy.
  const [activeView, setActiveView] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  const [selectedAppointment, setSelectedAppointment] = useState<ReceptionistAppointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    pendingAppointments,
    confirmedAppointments,
<<<<<<< HEAD
=======
    cancelledAppointments,
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
    doctorOptions,
    totalCount,
    isLoading,
    loadDashboardData,
  } = useReceptionistDashboard();

<<<<<<< HEAD
=======
  const isOverdueAppointment = (appointment: ReceptionistAppointment) => {
    const appointmentTimestamp = new Date(appointment.appointmentTime).getTime();
    if (Number.isNaN(appointmentTimestamp)) {
      return false;
    }

    return appointmentTimestamp < Date.now();
  };

  const visiblePendingAppointments = pendingAppointments.filter((appointment) => !isOverdueAppointment(appointment));

  const isNoShowCancelled = (appointment: ReceptionistAppointment) => {
    const status = (appointment.status ?? "").trim().toUpperCase();
    if (!["WAITING", "APPROVED", "CONFIRMED"].includes(status)) {
      return false;
    }

    const appointmentTimestamp = new Date(appointment.appointmentTime).getTime();
    if (Number.isNaN(appointmentTimestamp)) {
      return false;
    }

    return appointmentTimestamp < Date.now();
  };

  const mergedCancelledAppointments = (() => {
    const idSet = new Set<number>();
    const result: ReceptionistAppointment[] = [];

    cancelledAppointments.forEach((appointment) => {
      if (!idSet.has(appointment.id)) {
        idSet.add(appointment.id);
        result.push(appointment);
      }
    });

    confirmedAppointments
      .filter((appointment) => isNoShowCancelled(appointment))
      .forEach((appointment) => {
        if (!idSet.has(appointment.id)) {
          idSet.add(appointment.id);
          result.push({ ...appointment, status: "NO_SHOW_CANCELLED" });
        }
      });

    pendingAppointments
      .filter((appointment) => isOverdueAppointment(appointment))
      .forEach((appointment) => {
        if (!idSet.has(appointment.id)) {
          idSet.add(appointment.id);
          result.push({ ...appointment, status: "NO_SHOW_CANCELLED" });
        }
      });

    return result.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());
  })();

  // Tìm tên phòng theo doctorId để hiển thị ở danh sách lịch đã xác nhận.
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  const resolveRoomName = (doctorId?: number) => {
    if (!doctorId) {
      return "Chưa có";
    }

    const matched = doctorOptions.find((doctor) => doctor.doctorId === doctorId);
    return matched?.roomName || "Chưa có";
  };

  useEffect(() => {
<<<<<<< HEAD
    loadDashboardData().catch((error) => {
      toast.error(getApiErrorMessage(error, "Không thể tải dữ liệu lễ tân"));
    });
=======
    let disposed = false;

    const refresh = async (showErrorToast: boolean) => {
      try {
        await loadDashboardData();
      } catch (error) {
        if (!disposed && showErrorToast) {
          toast.error(getApiErrorMessage(error, "Không thể tải dữ liệu lễ tân"));
        }
      }
    };

    void refresh(true);

    const intervalId = window.setInterval(() => {
      void refresh(false);
    }, 30000);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  }, [loadDashboardData]);

  // Xử lý khi Lễ tân bấm nút "Xác nhận" trên thẻ lịch hẹn
  const handleOpenConfirmModal = (appointment: ReceptionistAppointment) => {
    setSelectedAppointment(appointment);
  };

  // Xử lý khi Lễ tân submit form trong Modal
<<<<<<< HEAD
=======
  // Chuẩn hóa datetime-local sang định dạng LocalDateTime backend mong đợi.
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
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

<<<<<<< HEAD
=======
  // Xác nhận lịch hẹn với bác sĩ và thời gian đã chọn.
  // Bước 1: Kiểm tra đã có lịch hẹn đang chọn.
  // Bước 2: Gọi API approve để gán bác sĩ + giờ khám.
  // Bước 3: Đóng modal, reload dữ liệu và hiển thị thông báo.
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
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
<<<<<<< HEAD
=======
  // Hủy lịch hẹn sau khi người dùng xác nhận, sau đó tải lại dashboard.
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
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
<<<<<<< HEAD
            pendingCount={pendingAppointments.length} 
=======
            pendingCount={visiblePendingAppointments.length} 
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
            confirmedCount={confirmedAppointments.length} 
            totalCount={totalCount} 
          />

          <div className={styles.flexRow}>
<<<<<<< HEAD
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
=======
            <button
              type="button"
              className={`${styles.button} ${activeView === "all" ? styles.primary : styles.outline}`}
              onClick={() => setActiveView("all")}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`${styles.button} ${activeView === "pending" ? styles.primary : styles.outline}`}
              onClick={() => setActiveView("pending")}
            >
              Chờ xác nhận
            </button>
            <button
              type="button"
              className={`${styles.button} ${activeView === "confirmed" ? styles.primary : styles.outline}`}
              onClick={() => setActiveView("confirmed")}
            >
              Đã xác nhận
            </button>
            <button
              type="button"
              className={`${styles.button} ${activeView === "cancelled" ? styles.primary : styles.outline}`}
              onClick={() => setActiveView("cancelled")}
            >
              Đã hủy
            </button>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
          </div>

          {isLoading && (
            <div className={styles.card}>
              <div className={styles.textCenter} style={{ padding: "2rem", color: "#64748b" }}>
                Đang tải dữ liệu lịch hẹn...
              </div>
            </div>
          )}

<<<<<<< HEAD
          {!isLoading && routeView !== "confirmed" && (
            <PendingAppointments 
              appointments={pendingAppointments} 
=======
          {!isLoading && (activeView === "all" || activeView === "pending") && (
            <PendingAppointments 
              appointments={visiblePendingAppointments} 
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
              onConfirmClick={handleOpenConfirmModal} 
              onCancelClick={handleCancelAppointment} 
              disabled={isSubmitting}
            />
          )}

<<<<<<< HEAD
          {!isLoading && routeView !== "pending" && (
=======
          {!isLoading && (activeView === "all" || activeView === "confirmed") && (
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
            <ConfirmedAppointments 
              appointments={confirmedAppointments} 
              resolveRoomName={resolveRoomName}
            />
          )}
<<<<<<< HEAD
=======

          {!isLoading && activeView === "cancelled" && (
            <CancelledAppointments
              appointments={mergedCancelledAppointments}
              resolveRoomName={resolveRoomName}
            />
          )}
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
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
<<<<<<< HEAD
      )}
=======
      )}  
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
    </>
  );
}