'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import styles from '@/features/patient/dashboard/dashboard.module.css';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Receipt,
  Settings,
  LogOut,
} from 'lucide-react';

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    toast.success('Đăng xuất thành công');
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>+</div>
          <span className={styles.logoText}>MEDICARE</span>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/patient/dashboard"
            className={`${styles.navItem} ${isActive('/patient/dashboard') ? styles.active : ''}`}
          >
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
          <a href="#" className={styles.navItem}>
            <Calendar size={20} /> Lịch hẹn
          </a>
          <Link
            href="/patient-history"
            className={`${styles.navItem} ${isActive('/patient-history') ? styles.active : ''}`}
          >
            <FileText size={20} /> Hồ sơ bệnh án
          </Link>
          <a href="#" className={styles.navItem}>
            <Receipt size={20} /> Hóa đơn
          </a>
          <a href="#" className={`${styles.navItem} ${styles.settingsLink}`}>
            <Settings size={20} /> Cài đặt
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
            <div>
              <div className={styles.userName}>Nguyễn Văn A</div>
              <div className={styles.userRole}>Bệnh nhân</div>
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

      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
