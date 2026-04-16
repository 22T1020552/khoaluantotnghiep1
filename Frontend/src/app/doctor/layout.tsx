'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BrandLogo } from '@/components/layout/brand-logo';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/common.module.css';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { username, role, logout } = useAuth();

  // Kiểm tra quyền truy cập - nếu không phải DOCTOR thì tự động đăng xuất
  useEffect(() => {
    if (role && role !== 'DOCTOR') {
      void logout();
      router.push('/signin');
    }
  }, [role, router, logout]);

  const handleLogout = async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    router.push('/');
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <BrandLogo className={styles.logoContainer} />

        <nav className={styles.nav}>
          <Link href="/doctor" className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
            <div>
              <div className={styles.userName}>{username || 'Bác sĩ trực'}</div>
              <div className={styles.userRole}>Khoa khám bệnh</div>
            </div>
          </div>
          <button className={`${styles.navItem} ${styles.logoutButton}`} type="button" onClick={() => void handleLogout()}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {children}
    </div>
  );
}