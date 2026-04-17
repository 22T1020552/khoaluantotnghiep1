'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings2,
  UserRound,
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
  { href: '/admin/reports', label: 'Báo cáo', icon: ClipboardList },
  { href: '/admin/settings', label: 'Cấu hình', icon: Settings2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();

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

        <div className={styles.sidebarFooter}>
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
