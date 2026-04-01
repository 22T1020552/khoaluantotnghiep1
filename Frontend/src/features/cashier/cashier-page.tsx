'use client';

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Prescription } from "@/types/pharmacy.type";
import PharmacyStats from "./components/pharmacy-stats";
import PendingPrescriptions from "./components/pending-prescriptions";
import DispensedPrescriptions from "./components/dispensed-prescriptions";
import PaymentDialog from "./components/payment-dialog";
import { initialPrescriptions } from "./mock-data";
import styles from "@/styles/common.module.css";
import { useRouter } from "next/navigation";

interface PharmacyDashboardProps {
  routeView?: "payment" | "history";
}

export function PharmacyDashboard({ routeView = "payment" }: PharmacyDashboardProps) {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    serviceFee: "50000",
    insuranceDiscount: "",
  });

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "pending");
  const dispensedPrescriptions = prescriptions.filter((p) => p.status === "dispensed");

  const totalRevenue = dispensedPrescriptions.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const openPaymentDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    
    // Auto calculate insurance discount (70% if have insurance)
    const insuranceDiscount = prescription.insuranceNumber 
      ? Math.floor((prescription.totalMedicationCost + 50000) * 0.7)
      : 0;
    
    setPaymentData({
      serviceFee: "50000",
      insuranceDiscount: insuranceDiscount.toString(),
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    // TODO sau này: Xóa localStorage, cookies hoặc token ở đây
    // localStorage.removeItem('token');
    
    toast.success("Đăng xuất thành công");
    router.push("/"); // Chuyển hướng về trang chủ
  };

  const handlePayment = () => {
    if (!selectedPrescription) return;

    const serviceFee = parseFloat(paymentData.serviceFee) || 0;
    const insuranceDiscount = parseFloat(paymentData.insuranceDiscount) || 0;
    const totalAmount = selectedPrescription.totalMedicationCost + serviceFee - insuranceDiscount;

    setPrescriptions(
      prescriptions.map((p) =>
        p.id === selectedPrescription.id
          ? { ...p, status: "dispensed", serviceFee, insuranceDiscount, totalAmount }
          : p
      )
    );

    toast.success(`Thanh toán thành công! Tổng tiền: ${totalAmount.toLocaleString("vi-VN")}đ`);
    setIsPaymentOpen(false);
    setSelectedPrescription(null);
  };

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>+</div>
          <span className={styles.logoText}>MEDICARE</span>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/cashier"
            className={`${styles.navItem} ${routeView === "payment" ? styles.active : ""}`}
          >
            <LayoutDashboard size={20} /> Thanh toán
          </Link>
          <Link
            href="/cashier/history"
            className={`${styles.navItem} ${routeView === "history" ? styles.active : ""}`}
          >
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
            <button 
                className={`${styles.navItem} ${styles.logoutButton}`} 
                type="button"
                onClick={handleLogout}
            >
                <LogOut size={20} /> Đăng xuất
            </button>
        </div>
      </aside>

      <main className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Quầy thuốc & Thu ngân</h1>
            <p>Kê thuốc theo đơn và thanh toán viện phí</p>
          </div>

          <PharmacyStats 
            pendingCount={pendingPrescriptions.length}
            dispensedCount={dispensedPrescriptions.length}
            totalRevenue={totalRevenue}
          />

          <PendingPrescriptions 
            prescriptions={pendingPrescriptions}
            onOpenPayment={openPaymentDialog}
          />

          <DispensedPrescriptions 
            prescriptions={dispensedPrescriptions}
          />

          <PaymentDialog 
            isOpen={isPaymentOpen}
            onOpenChange={setIsPaymentOpen}
            prescription={selectedPrescription}
            paymentData={paymentData}
            onPaymentDataChange={handlePaymentDataChange}
            onConfirm={handlePayment}
          />
        </div>
      </main>
    </div>
  );
}