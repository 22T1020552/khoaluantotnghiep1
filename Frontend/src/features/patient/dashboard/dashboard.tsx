'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { 
  Search, Bell, LayoutDashboard, Calendar, FileText, 
  Receipt, Settings, LogOut, Plus, Clock, User, MapPin, Download 
} from 'lucide-react';
import { toast } from "sonner";

export default function PatientDashboard() {
  const router = useRouter();
  const handleLogout = () => {
    // TODO sau này: Xóa localStorage, cookies hoặc token ở đây
    // localStorage.removeItem('token');
    
    toast.success("Đăng xuất thành công");
    router.push("/"); // Chuyển hướng về trang chủ
  };

  return (
    <div className={styles.container}>
      
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>+</div>
          <span className={styles.logoText}>MEDICARE</span>
        </div>

        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            <LayoutDashboard size={20} /> Tổng quan
          </a>
          <a href="#" className={styles.navItem}>
            <Calendar size={20} /> Lịch hẹn
          </a>
          <a href="#" className={styles.navItem}>
            <FileText size={20} /> Hồ sơ bệnh án
          </a>
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

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Tìm kiếm..." className={styles.searchInput} />
          </div>
          <div className={styles.headerActions}>
            <Bell size={24} color="#64748b" style={{ cursor: 'pointer' }} />
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
          </div>
        </header>

        {/* CONTENT */}
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>Chào mừng trở lại, Nguyễn Văn A!</h1>

          {/* BANNER */}
          <div className={styles.banner}>
            <h2 className={styles.bannerTitle}>Sức khỏe của bạn là ưu tiên của chúng tôi.</h2>
            <p className={styles.bannerDesc}>Dễ dàng đặt lịch khám ngay hôm nay.</p>
            <button className={styles.btnPrimary} onClick={() => router.push('/booking')}>
              <Plus size={20} /> ĐẶT LỊCH KHÁM NGAY
            </button>
          </div>

          {/* CARDS GRID */}
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Lịch hẹn sắp tới</h3>
              <div className={styles.cardRow}>
                <Calendar size={16} color="#2563eb" /> 15 Tháng 4, 2026
                <Clock size={16} color="#2563eb" style={{ marginLeft: '8px' }} /> 09:00 AM
              </div>
              <div className={styles.cardRow}>
                <User size={16} color="#2563eb" /> ThS.BS. Lê Thị B
              </div>
              <div className={styles.cardRow}>
                <MapPin size={16} color="#2563eb" /> Phòng 301 - Nội tổng quát
              </div>
              <button className={styles.btnOutline}>Chi tiết</button>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Toa thuốc gần nhất</h3>
              <div className={styles.cardRow}>• Amoxicillin 500mg</div>
              <div className={styles.cardRow}>• Paracetamol 500mg</div>
              <button className={styles.btnOutline} style={{ marginTop: '28px' }}>Xem tất cả</button>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Kết quả xét nghiệm</h3>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
                Xét nghiệm máu tổng quát
              </div>
              <div className={styles.cardRow}>
                <span className={styles.statusBadge}>Hoàn tất</span>
                <span>01/04/2026</span>
              </div>
              <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#334155', borderColor: '#e2e8f0' }}>
                <Download size={16} /> Tải về
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Lịch sử khám bệnh gần đây</h3>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ngày khám</th>
                  <th>Bác sĩ</th>
                  <th>Chẩn đoán</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 500 }}>10/01/2026</td>
                  <td>BS. Trần Văn C</td>
                  <td>Viêm họng cấp</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.btnAction}>Xem lại</button>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500 }}>25/11/2025</td>
                  <td>BS. Nguyễn Văn D</td>
                  <td>Kiểm tra sức khỏe định kỳ</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.btnAction}>Xem lại</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}