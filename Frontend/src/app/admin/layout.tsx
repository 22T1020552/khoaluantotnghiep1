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
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import styles from '@/styles/common.module.css';

const navItems = [
  { href: '/admin', label: 'Tong quan', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Nguoi dung', icon: UserRound },
  { href: '/admin/rooms', label: 'Phong kham', icon: Building2 },
  { href: '/admin/medicines', label: 'Danh muc thuoc', icon: Pill },
  { href: '/admin/services', label: 'Dich vu', icon: Activity },
  { href: '/admin/reports', label: 'Bao cao', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    toast.success('Dang xuat thanh cong');
    router.push('/');
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>+</div>
          <span className={styles.logoText}>PHONG KHAM</span>
        </div>

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
              <div className={styles.userName}>Quan tri vien</div>
              <div className={styles.userRole}>admin@phongkham.vn</div>
            </div>
          </div>
          <button className={`${styles.navItem} ${styles.logoutButton}`} type='button' onClick={handleLogout}>
            <LogOut size={20} /> Dang xuat
          </button>
        </div>
      </aside>

      {children}
    </div>
  );
}
