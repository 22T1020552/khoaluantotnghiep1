'use client';

import React from 'react';
<<<<<<< HEAD
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
=======
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
import { BrandLogo } from '@/components/layout/brand-logo';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/common.module.css';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  const router = useRouter();
  const { username, logout } = useAuth();
=======
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

  const handleLogout = async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    router.push('/');
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
<<<<<<< HEAD
        <BrandLogo className={styles.logoContainer} />

        <nav className={styles.nav}>
=======
        <div className={styles.mobileTopBar}>
          <button
            type="button"
            className={styles.hamburgerButton}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className={styles.mobileUserActions}>
            <div className={styles.mobileUserMeta}>
              <div className={styles.mobileUserName}>{username || 'Bác sĩ trực'}</div>
              <div className={styles.mobileUserRole}>Khoa khám bệnh</div>
            </div>
            <button
              className={styles.mobileLogoutButton}
              type="button"
              aria-label="Đăng xuất"
              onClick={() => void handleLogout()}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <BrandLogo className={styles.logoContainer} />

        <nav className={`${styles.nav} ${mobileMenuOpen ? '' : styles.navCollapsed}`}>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
          <Link href="/doctor" className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={20} /> Tổng quan
          </Link>
        </nav>

<<<<<<< HEAD
        <div className={styles.sidebarFooter}>
=======
        <div className={`${styles.sidebarFooter} ${styles.desktopSidebarFooter}`}>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
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