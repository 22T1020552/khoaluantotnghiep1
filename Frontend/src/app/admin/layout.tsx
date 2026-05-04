'use client';

import React from 'react';
<<<<<<< HEAD
=======
import { useEffect, useState } from 'react';
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Building2,
  LayoutDashboard,
  LogOut,
  Pill,
<<<<<<< HEAD
  UserRound,
=======
  Settings2,
  UserRound,
  Menu,
  X,
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/layout/brand-logo';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/common.module.css';

const navItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Người dùng', icon: UserRound },
  { href: '/admin/rooms', label: 'Phòng khám', icon: Building2 },
  { href: '/admin/medicines', label: 'Danh mục thuốc', icon: Pill },
  { href: '/admin/services', label: 'Dịch vụ', icon: Activity },
<<<<<<< HEAD
  { href: '/admin/reports', label: 'Báo cáo', icon: ClipboardList },
<<<<<<< HEAD
=======
=======
>>>>>>> 35356c066a402fc03e5917b0f20255ed18d8b9d1
  { href: '/admin/settings', label: 'Cấu hình', icon: Settings2 },
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();
<<<<<<< HEAD
=======
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
              <div className={styles.mobileUserName}>{username || 'Quản trị viên'}</div>
              <div className={styles.mobileUserRole}>ADMIN</div>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>

<<<<<<< HEAD
        <div className={styles.sidebarFooter}>
=======
        <div className={`${styles.sidebarFooter} ${styles.desktopSidebarFooter}`}>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
          <div className={styles.userInfo}>
            <img src='https://github.com/shadcn.png' alt='Avatar' className={styles.avatar} />
            <div>
              <div className={styles.userName}>{username || 'Quản trị viên'}</div>
              <div className={styles.userRole}>ADMIN</div>
            </div>
          </div>
          <button className={`${styles.navItem} ${styles.logoutButton}`} type='button' onClick={() => void handleLogout()}>
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {children}
    </div>
  );
}
