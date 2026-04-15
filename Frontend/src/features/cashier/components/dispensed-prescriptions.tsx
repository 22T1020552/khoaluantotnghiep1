import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Prescription } from "@/types/pharmacy.type";
import styles from "../cashier.module.css";

interface DispensedPrescriptionsProps {
  prescriptions: Prescription[];
}

function DispensedPrescriptions({ prescriptions }: DispensedPrescriptionsProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Đã thanh toán ({prescriptions.length})
      </h2>
      <div className={styles.doneGrid}>
        {prescriptions.map((prescription, idx) => (
          <Card key={`${prescription.id}-${prescription.invoiceId ?? "na"}-${idx}`} className={styles.doneCard}>
            <div className={styles.doneHeader}>
              <div>
                <h3 className={styles.doneName}>{prescription.patientName}</h3>
                <p className={styles.donePhone}>{prescription.phone}</p>
              </div>
              <Badge className={styles.doneBadge}>Đã thanh toán</Badge>
            </div>

            <div className={styles.amountList}>
              <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Bác sĩ:</span>
                <span className={styles.amountValue}>{prescription.doctor}</span>
              </div>
              <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Ngày khám:</span>
                <span className={styles.amountValue}>
                  {new Date(prescription.date).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className={`${styles.amountRow} ${styles.amountBorder}`}>
                <span className={styles.amountLabel}>Tiền thuốc:</span>
                <span className={styles.amountValue}>
                  {prescription.totalMedicationCost.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Phí khám:</span>
                <span className={styles.amountValue}>
                  {prescription.serviceFee?.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {prescription.insuranceDiscount && prescription.insuranceDiscount > 0 && (
                <div className={`${styles.amountRow} ${styles.discountRow}`}>
                  <span>Giảm trừ BHYT:</span>
                  <span className={styles.amountValue}>
                    -{prescription.insuranceDiscount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className={`${styles.amountRow} ${styles.totalRow}`}>
                <span className={styles.totalLabel}>Tổng cộng:</span>
                <span className={styles.totalValue}>
                  {prescription.totalAmount?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </Card>
        ))}

        {prescriptions.length === 0 && (
          <Card className={styles.emptyCard}>
            <CheckCircle size={44} color="#cbd5e1" />
            <p className={styles.emptyText}>Chưa có đơn thuốc được thanh toán</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export { DispensedPrescriptions };
export default DispensedPrescriptions;