'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/layout/brand-logo';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/common.module.css';

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    router.push('/');
  };

  const isActive =
    pathname === '/receptionist' || pathname === '/receptionist/pending' || pathname === '/receptionist/confirmed';

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <BrandLogo className={styles.logoContainer} />

        <nav className={styles.nav}>
          <Link href="/receptionist" className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
            <div>
              <div className={styles.userName}>{username || 'Lễ tân trực'}</div>
              <div className={styles.userRole}>Quầy tiếp nhận</div>
            </div>
          </div>
          <button className={`${styles.navItem} ${styles.logoutButton}`} type="button" onClick={handleLogout}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {children}
    </div>
  );
}
