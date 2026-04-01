"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  DollarSign,
  Download,
  LayoutDashboard,
  LogOut,
  Receipt,
  Search,
  User,
} from "lucide-react";
import styles from "@/styles/common.module.css";
import historyStyles from "./invoice-history.module.css";
import cashierStyles from "./cashier.module.css";

interface Invoice {
  id: string;
  date: string;
  patientName: string;
  phone: string;
  services: string[];
  medicationCost: number;
  serviceFee: number;
  insuranceDiscount: number;
  totalAmount: number;
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    date: "2026-03-24",
    patientName: "Phạm Thị Dung",
    phone: "0945678901",
    services: ["Khám thai", "Siêu âm thai"],
    medicationCost: 354000,
    serviceFee: 50000,
    insuranceDiscount: 282800,
    totalAmount: 121200,
  },
  {
    id: "INV-002",
    date: "2026-03-24",
    patientName: "Nguyễn Văn An",
    phone: "0912345678",
    services: ["Khám tổng quát"],
    medicationCost: 100000,
    serviceFee: 50000,
    insuranceDiscount: 105000,
    totalAmount: 45000,
  },
  {
    id: "INV-003",
    date: "2026-03-24",
    patientName: "Lê Minh Cường",
    phone: "0934567890",
    services: ["Khám tổng quát"],
    medicationCost: 60000,
    serviceFee: 50000,
    insuranceDiscount: 0,
    totalAmount: 110000,
  },
];

export function InvoicesHistory() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = mockInvoices.filter((invoice) => {
    return (
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.phone.includes(searchQuery)
    );
  });

  const handlePrint = (invoiceId: string) => {
    alert(`In hóa đơn ${invoiceId}`);
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>+</div>
          <span className={styles.logoText}>MEDICARE</span>
        </div>

        <nav className={styles.nav}>
          <Link href="/cashier" className={styles.navItem}>
            <LayoutDashboard size={20} /> Thanh toán
          </Link>
          <Link href="/cashier/history" className={`${styles.navItem} ${styles.active}`}>
            <Receipt size={20} /> Lịch sử giao dịch
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src="https://github.com/shadcn.png" alt="Avatar" className={styles.avatar} />
            <div>
              <div className={styles.userName}>Thu ngân trực</div>
              <div className={styles.userRole}>Quầy thanh toán</div>
            </div>
          </div>
          <button className={`${styles.navItem} ${styles.logoutButton}`} type="button">
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Lịch sử thanh toán</h1>
            <p>Xem và in lại hóa đơn đã thanh toán</p>
          </div>

          <div className={historyStyles.wrapper}>
            <div className={cashierStyles.statsGrid}>
              <Card className={cashierStyles.statCard}>
                <div className={cashierStyles.statInner}>
                  <div className={`${cashierStyles.statIcon} ${cashierStyles.statIconBlue}`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className={cashierStyles.statLabel}>Hóa đơn hôm nay</p>
                    <p className={cashierStyles.statValue}>{mockInvoices.length}</p>
                  </div>
                </div>
              </Card>

              <Card className={cashierStyles.statCard}>
                <div className={cashierStyles.statInner}>
                  <div className={`${cashierStyles.statIcon} ${cashierStyles.statIconGreen}`}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className={cashierStyles.statLabel}>Doanh thu hôm nay</p>
                    <p className={cashierStyles.statValue}>
                      {mockInvoices
                        .reduce((sum, inv) => sum + inv.totalAmount, 0)
                        .toLocaleString("vi-VN")}
                      đ
                    </p>
                  </div>
                </div>
              </Card>

              <Card className={cashierStyles.statCard}>
                <div className={cashierStyles.statInner}>
                  <div className={`${cashierStyles.statIcon} ${historyStyles.statIconPurple}`}>
                    <User size={24} />
                  </div>
                  <div>
                    <p className={cashierStyles.statLabel}>Bệnh nhân</p>
                    <p className={cashierStyles.statValue}>{mockInvoices.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className={historyStyles.searchBox}>
              <Search size={18} className={historyStyles.searchIcon} />
              <Input
                placeholder="Tìm kiếm theo mã hóa đơn, tên bệnh nhân hoặc SĐT..."
                className={historyStyles.searchInput}
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={historyStyles.list}>
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className={historyStyles.historyCard}>
                  <div className={historyStyles.headerRow}>
                    <div>
                      <div className={historyStyles.metaRow}>
                        <h3 className={historyStyles.title}>{invoice.patientName}</h3>
                        <Badge variant="secondary" className={historyStyles.idBadge}>{invoice.id}</Badge>
                      </div>
                      <div className={historyStyles.metaRow}>
                        <div className={historyStyles.metaItem}>
                          <Calendar size={14} />
                          <span>{new Date(invoice.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className={historyStyles.metaItem}>
                          <User size={14} />
                          <span>{invoice.phone}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className={historyStyles.printButton} onClick={() => handlePrint(invoice.id)}>
                      <Download size={14} />
                      In hóa đơn
                    </Button>
                  </div>

                  <div className={historyStyles.servicesBox}>
                    <p className={historyStyles.servicesTitle}>Dịch vụ sử dụng:</p>
                    <div className={historyStyles.servicesWrap}>
                      {invoice.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary" className={historyStyles.serviceBadge}>
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className={cashierStyles.amountList}>
                    <div className={`${cashierStyles.amountRow} ${cashierStyles.amountBorder}`}>
                      <span className={cashierStyles.amountLabel}>Tiền thuốc:</span>
                      <span className={cashierStyles.amountValue}>{invoice.medicationCost.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className={cashierStyles.amountRow}>
                      <span className={cashierStyles.amountLabel}>Phí khám:</span>
                      <span className={cashierStyles.amountValue}>{invoice.serviceFee.toLocaleString("vi-VN")}đ</span>
                    </div>
                    {invoice.insuranceDiscount > 0 && (
                      <div className={`${cashierStyles.amountRow} ${cashierStyles.discountRow}`}>
                        <span>Giảm trừ BHYT:</span>
                        <span className={cashierStyles.amountValue}>-{invoice.insuranceDiscount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    )}
                    <div className={`${cashierStyles.amountRow} ${cashierStyles.totalRow}`}>
                      <span className={cashierStyles.totalLabel}>Tổng cộng:</span>
                      <span className={cashierStyles.totalValue}>{invoice.totalAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredInvoices.length === 0 && (
                <Card className={cashierStyles.emptyCard}>
                  <Search size={44} color="#cbd5e1" />
                  <p className={cashierStyles.emptyText}>Không tìm thấy hóa đơn nào</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
