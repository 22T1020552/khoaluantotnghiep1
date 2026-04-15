'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/layout/brand-logo';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/common.module.css';

export default function CashierLayout({
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

  const isPaymentActive = pathname === '/cashier';
  const isHistoryActive = pathname === '/cashier/history';

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <BrandLogo className={styles.logoContainer} />

        <nav className={styles.nav}>
          <Link href="/cashier" className={`${styles.navItem} ${isPaymentActive ? styles.active : ''}`}>
            <LayoutDashboard size={20} /> Thanh toán
          </Link>
          <Link href="/cashier/history" className={`${styles.navItem} ${isHistoryActive ? styles.active : ''}`}>
            <Receipt size={20} /> Lịch sử giao dịch
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
            <div>
              <div className={styles.userName}>{username || 'Thu ngân trực'}</div>
              <div className={styles.userRole}>Quầy thanh toán</div>
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
