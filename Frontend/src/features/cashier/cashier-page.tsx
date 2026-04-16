'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ForbiddenSectionNotice } from "@/components/ui/forbidden-section-notice";
import { Prescription } from "@/types/pharmacy.type";
import PharmacyStats from "./components/pharmacy-stats";
import PendingPrescriptions from "./components/pending-prescriptions";
import DispensedPrescriptions from "./components/dispensed-prescriptions";
import PaymentDialog from "./components/payment-dialog";
import { cashierService } from "@/services/cashierService";
import { getApiErrorMessage, isForbiddenError } from "@/services/api";
import styles from "@/styles/common.module.css";

export function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    serviceFee: "0",
    insuranceDiscount: "0",
  });
  const [paymentMethod, setPaymentMethod] = useState<"TIEN_MAT" | "CHUYEN_KHOAN" | "POS">("TIEN_MAT");
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pendingForbidden, setPendingForbidden] = useState(false);
  const [historyForbidden, setHistoryForbidden] = useState(false);
  const [pendingDetailsForbidden, setPendingDetailsForbidden] = useState(false);
  const [historyDetailsForbidden, setHistoryDetailsForbidden] = useState(false);

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "pending");
  const dispensedPrescriptions = prescriptions.filter((p) => p.status === "dispensed");

  const toPrescription = (
    detail: Awaited<ReturnType<typeof cashierService.searchPaymentRecord>>,
    status: "pending" | "dispensed",
    paidAt?: string,
    paymentMethod?: string,
  ): Prescription => {
    const totalMedicationCost = Number(detail.totalMedicineFee || 0);
    const serviceFee = Number(detail.totalServiceFee || 0);
    const totalAmount = Number(detail.totalAmount || 0);
    const insuranceDiscount = Math.max(totalMedicationCost + serviceFee - totalAmount, 0);

    return {
      id: `RX-${detail.invoiceId}`,
      invoiceId: detail.invoiceId,
      medicalRecordId: detail.medicalRecordId,
      patientName: detail.patientName,
      phone: detail.phoneNumber || "",
      insuranceNumber: insuranceDiscount > 0 ? "Có áp dụng" : "",
      doctor: `HS #${detail.medicalRecordId}`,
      diagnosis: "Theo bệnh án từ bác sĩ",
      treatment: "Thanh toán và cấp phát thuốc theo đơn",
      prescriptionItems: (detail.medicines || []).map((item) => ({
        medicationId: String(item.medicineId),
        medicationName: item.medicineName,
        dosage: "",
        unit: "đv",
        quantity: item.quantity,
        price: Number(item.unitPrice || 0),
        usage: item.usageInstructions || "Chưa cập nhật",
      })),
      totalMedicationCost,
      date: paidAt || detail.appointmentTime,
      status,
      serviceFee,
      insuranceDiscount,
      totalAmount,
      paymentMethod,
    };
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [queueResult, historyResult] = await Promise.allSettled([
        cashierService.getWaitingPaymentQueue(),
        cashierService.getTransactionHistory(),
      ]);

      const nonForbiddenErrors: unknown[] = [];
      let pendingMapped: Prescription[] = [];
      let paidMapped: Prescription[] = [];

      if (queueResult.status === "fulfilled") {
        const pendingDetailsResults = await Promise.allSettled(
          queueResult.value.map((item) => cashierService.searchPaymentRecord(String(item.invoiceId))),
        );

        const mappedPending: Prescription[] = [];
        let pendingDetailForbiddenDetected = false;
        pendingDetailsResults.forEach((result) => {
          if (result.status === "fulfilled") {
            mappedPending.push(toPrescription(result.value, "pending"));
          } else if (isForbiddenError(result.reason)) {
            pendingDetailForbiddenDetected = true;
          } else {
            nonForbiddenErrors.push(result.reason);
          }
        });

        pendingMapped = mappedPending;
        setPendingForbidden(false);
        setPendingDetailsForbidden(pendingDetailForbiddenDetected);
      } else if (isForbiddenError(queueResult.reason)) {
        setPendingForbidden(true);
        setPendingDetailsForbidden(false);
      } else {
        nonForbiddenErrors.push(queueResult.reason);
      }

      if (historyResult.status === "fulfilled") {
        const paidDetailsResults = await Promise.allSettled(
          (historyResult.value.transactions || []).map((item) =>
            cashierService
              .getPaidInvoiceDetail(item.invoiceId)
              .then((detail) => ({ detail, paidAt: item.paidAt, paymentMethod: item.paymentMethod })),
          ),
        );

        const mappedPaid: Prescription[] = [];
        let paidDetailForbiddenDetected = false;
        paidDetailsResults.forEach((result) => {
          if (result.status === "fulfilled") {
            mappedPaid.push(toPrescription(result.value.detail, "dispensed", result.value.paidAt, result.value.paymentMethod));
          } else if (isForbiddenError(result.reason)) {
            paidDetailForbiddenDetected = true;
          } else {
            nonForbiddenErrors.push(result.reason);
          }
        });

        paidMapped = mappedPaid;
        setHistoryForbidden(false);
        setHistoryDetailsForbidden(paidDetailForbiddenDetected);
      } else if (isForbiddenError(historyResult.reason)) {
        setHistoryForbidden(true);
        setHistoryDetailsForbidden(false);
      } else {
        nonForbiddenErrors.push(historyResult.reason);
      }

      const merged = [...pendingMapped, ...paidMapped];
      const unique = new Map<string, Prescription>();
      merged.forEach((item) => {
        const key = `${item.invoiceId ?? item.id}-${item.status}`;
        if (!unique.has(key)) {
          unique.set(key, item);
        }
      });
      setPrescriptions(Array.from(unique.values()));

      if (nonForbiddenErrors.length > 0) {
        toast.error(getApiErrorMessage(nonForbiddenErrors[0], "Không thể tải một phần dữ liệu thu ngân"));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải dữ liệu thu ngân"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const totalRevenue = dispensedPrescriptions.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const openPaymentDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setPaymentMethod("TIEN_MAT");
    setTransferConfirmed(false);
    setPaymentData({
      serviceFee: String(Math.floor(prescription.serviceFee || 0)),
      insuranceDiscount: String(Math.floor(prescription.insuranceDiscount || 0)),
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!selectedPrescription?.invoiceId) return;

    if (paymentMethod === "CHUYEN_KHOAN" && !transferConfirmed) {
      toast.error("Vui lòng xác nhận đã nhận chuyển khoản trước khi thanh toán");
      return;
    }

    if (paymentMethod === "POS" && !transferConfirmed) {
      toast.error("Vui lòng xác nhận giao dịch POS thành công trước khi thanh toán");
      return;
    }

    try {
      setProcessing(true);
      const response = await cashierService.processPayment(selectedPrescription.invoiceId, {
        paymentMethod,
        paymentSuccessful: paymentMethod === "TIEN_MAT" ? true : transferConfirmed,
        exportInvoice: false,
        applyHealthInsurance: Number(paymentData.insuranceDiscount || 0) > 0,
      });

      toast.success(response.message || "Thanh toán thành công");
      setIsPaymentOpen(false);
      setSelectedPrescription(null);
      await loadDashboardData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Thanh toán thất bại"));
    } finally {
      setProcessing(false);
    }
  };

  return (
      <main className={styles.mainArea}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Quầy thuốc & Thu ngân</h1>
            <p>Kê thuốc theo đơn và thanh toán viện phí</p>
          </div>

          {loading && <div className={styles.emptyBox}>Đang tải dữ liệu...</div>}

          {!loading && (
            <>
              {(pendingForbidden || historyForbidden || pendingDetailsForbidden || historyDetailsForbidden) && (
                <div className={styles.card} style={{ marginBottom: "1rem" }}>
                  {pendingForbidden && <p style={{ color: "#b91c1c" }}><ForbiddenSectionNotice area="đơn chờ thanh toán" /></p>}
                  {historyForbidden && <p style={{ color: "#b91c1c" }}><ForbiddenSectionNotice area="lịch sử đã thanh toán" /></p>}
                  {pendingDetailsForbidden && !pendingForbidden && (
                    <p style={{ color: "#b45309" }}><ForbiddenSectionNotice area="chi tiết đơn chờ thanh toán" variant="partial" /></p>
                  )}
                  {historyDetailsForbidden && !historyForbidden && (
                    <p style={{ color: "#b45309" }}><ForbiddenSectionNotice area="chi tiết lịch sử thanh toán" variant="partial" /></p>
                  )}
                </div>
              )}

              <PharmacyStats 
                pendingCount={pendingPrescriptions.length}
                dispensedCount={dispensedPrescriptions.length}
                totalRevenue={totalRevenue}
              />

              {pendingForbidden ? (
                <div className={styles.card}>
                  <div className={styles.emptyBox} style={{ color: "#b91c1c" }}>
                    <ForbiddenSectionNotice area="danh sách đơn chờ thanh toán" />
                  </div>
                </div>
              ) : (
                <PendingPrescriptions 
                  prescriptions={pendingPrescriptions}
                  onOpenPayment={openPaymentDialog}
                />
              )}

              {historyForbidden ? (
                <div className={styles.card}>
                  <div className={styles.emptyBox} style={{ color: "#b91c1c" }}>
                    <ForbiddenSectionNotice area="danh sách đơn đã thanh toán" />
                  </div>
                </div>
              ) : (
                <DispensedPrescriptions 
                  prescriptions={dispensedPrescriptions}
                />
              )}
            </>
          )}

          <PaymentDialog 
            isOpen={isPaymentOpen}
            onOpenChange={setIsPaymentOpen}
            prescription={selectedPrescription}
            paymentData={paymentData}
            onPaymentDataChange={handlePaymentDataChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            transferConfirmed={transferConfirmed}
            onTransferConfirmedChange={setTransferConfirmed}
            onConfirm={handlePayment}
            isProcessing={processing}
          />
        </div>
      </main>
  );
}