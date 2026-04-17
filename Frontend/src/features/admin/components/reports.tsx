"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Calendar, DollarSign, Package, ShoppingBag, Stethoscope, Users } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/services/api";
import { adminService, type AdminDashboardData } from "@/services/adminService";
import styles from "../admin.module.css";

const emptyDashboard: AdminDashboardData = {
  totalPatients: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  totalMedicalRecords: 0,
  todayAppointments: 0,
  pendingAppointments: 0,
  confirmedAppointments: 0,
  cancelledAppointments: 0,
  thisMonthAppointments: 0,
};

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải dashboard quản trị"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totalRevenueHint = useMemo(() => {
    const base = dashboard.totalAppointments * 150000;
    return `${Math.round(base / 1000000)}M`;
  }, [dashboard.totalAppointments]);

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Bảng điều khiển quản trị</h1>
          <p>Tổng quan hệ thống phòng khám và các chỉ số vận hành.</p>
        </div>

        {loading ? (
          <section className={styles.card}>
            <div className={styles.emptyBox}>Đang tải dữ liệu...</div>
          </section>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <section className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statBlue}`}>
                  <Users size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Tổng bệnh nhân</p>
                  <p className={styles.statValue}>{dashboard.totalPatients.toLocaleString("vi-VN")}</p>
                </div>
              </section>

              <section className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statGreen}`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Lượt khám tháng này</p>
                  <p className={styles.statValue}>{dashboard.thisMonthAppointments.toLocaleString("vi-VN")}</p>
                </div>
              </section>

              <section className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statOrange}`}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Bác sĩ</p>
                  <p className={styles.statValue}>{dashboard.totalDoctors.toLocaleString("vi-VN")}</p>
                </div>
              </section>

              <section className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.statRed}`}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className={styles.statLabel}>Ước tính doanh thu</p>
                  <p className={styles.statValue}>{totalRevenueHint}</p>
                </div>
              </section>
            </div>

            <div className={styles.cardsGrid}>
              <section className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>Tình trạng lịch hẹn</h3>
                  <Activity size={20} color="#16a34a" />
                </div>
                <div className={styles.barGroup}>
                  <div className={styles.barRow}>
                    <span className={styles.itemMeta}>Đang chờ</span>
                    <div className={styles.progress}>
                      <div className={styles.progressFill} style={{ width: `${dashboard.pendingAppointments || 0}%` }} />
                    </div>
                    <span className={styles.itemMeta}>{dashboard.pendingAppointments}</span>
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.itemMeta}>Đã xác nhận</span>
                    <div className={styles.progress}>
                      <div className={styles.progressFill} style={{ width: `${dashboard.confirmedAppointments || 0}%` }} />
                    </div>
                    <span className={styles.itemMeta}>{dashboard.confirmedAppointments}</span>
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.itemMeta}>Đã hủy</span>
                    <div className={styles.progress}>
                      <div className={styles.progressFill} style={{ width: `${dashboard.cancelledAppointments || 0}%` }} />
                    </div>
                    <span className={styles.itemMeta}>{dashboard.cancelledAppointments}</span>
                  </div>
                </div>
              </section>

              <section className={styles.itemCard}>
                <h3 className={styles.itemTitle}>Số liệu hồ sơ</h3>
                <div className={styles.barGroup}>
                  <div className={styles.barRow}>
                    <span className={styles.itemMeta}>Lịch hẹn hôm nay</span>
                    <div className={styles.progress}>
                      <div className={styles.progressFill} style={{ width: `${dashboard.todayAppointments || 0}%` }} />
                    </div>
                    <span className={styles.itemMeta}>{dashboard.todayAppointments}</span>
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.itemMeta}>Tổng lịch hẹn</span>
                    <div className={styles.progress}>
                      <div className={styles.progressFill} style={{ width: "100%" }} />
                    </div>
                    <span className={styles.itemMeta}>{dashboard.totalAppointments}</span>
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.itemMeta}>Hồ sơ bệnh án</span>
                    <div className={styles.progress}>
                      <div className={styles.progressFill} style={{ width: "100%" }} />
                    </div>
                    <span className={styles.itemMeta}>{dashboard.totalMedicalRecords}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className={styles.cardsGrid}>
              <section className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={`${styles.statIcon} ${styles.statBlue}`}>
                    <Activity size={20} />
                  </div>
                </div>
                <p className={styles.itemMeta}>Lịch hẹn đang chờ</p>
                <p className={styles.statValue}>{dashboard.pendingAppointments}</p>
              </section>

              <section className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={`${styles.statIcon} ${styles.statGreen}`}>
                    <Package size={20} />
                  </div>
                </div>
                <p className={styles.itemMeta}>Hồ sơ bệnh án</p>
                <p className={styles.statValue}>{dashboard.totalMedicalRecords}</p>
              </section>

              <section className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={`${styles.statIcon} ${styles.statOrange}`}>
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <p className={styles.itemMeta}>Lịch hẹn hôm nay</p>
                <p className={styles.statValue}>{dashboard.todayAppointments}</p>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
