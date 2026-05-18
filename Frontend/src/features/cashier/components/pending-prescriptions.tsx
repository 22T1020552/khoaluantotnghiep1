import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Phone, User, Clock } from "lucide-react";
import { Prescription } from "@/types/pharmacy.type";
import styles from "../cashier.module.css";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    amount,
  );

interface PendingPrescriptionsProps {
  prescriptions: Prescription[];
  onOpenPayment: (prescription: Prescription) => void;
}

function PendingPrescriptions({ prescriptions, onOpenPayment }: PendingPrescriptionsProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Hồ sơ chờ thanh toán ({prescriptions.length})
      </h2>
      <div className={styles.list}>
        {prescriptions.map((prescription, idx) => (
          <Card key={`${prescription.id}-${prescription.invoiceId ?? "na"}-${idx}`} className={styles.prescriptionCard}>
            <div className={styles.topRow}>
              <div className={styles.patientBlock}>
                <div className={styles.avatarBadge}>
                  {prescription.patientName.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className={styles.patientName}>{prescription.patientName}</h3>
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Phone size={14} />
                      <span>{prescription.phone}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <User size={14} />
                      <span>{prescription.doctor}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.rightCol}>
                <Badge variant="secondary" className={styles.dateBadge}>
                  {new Date(prescription.date).toLocaleDateString("vi-VN")}
                </Badge>
                {prescription.insuranceNumber && (
                  <Badge className={styles.insuranceBadge}>Có BHYT</Badge>
                )}
              </div>
            </div>

            <div className={styles.bodyStack}>
              <div className={styles.diagnosisBox}>
                <p className={`${styles.boxTitle} ${styles.diagnosisTitle}`}>Chẩn đoán:</p>
                <p className={`${styles.boxText} ${styles.diagnosisText}`}>{prescription.diagnosis}</p>
              </div>

              <div className={styles.treatmentBox}>
                <p className={`${styles.boxTitle} ${styles.treatmentTitle}`}>Điều trị:</p>
                <p className={`${styles.boxText} ${styles.treatmentText}`}>{prescription.treatment}</p>
              </div>
              {prescription.remainingAmount !== undefined && (
                <div className={styles.treatmentBox}>
                  <p className={`${styles.boxTitle} ${styles.treatmentTitle}`}>Còn lại cần thu:</p>
                  <p className={`${styles.boxText} ${styles.treatmentText}`}>
                    {formatCurrency(prescription.remainingAmount)}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={() => onOpenPayment(prescription)} className={styles.actionBtn}>
              <ShoppingBag size={16} />
              Thanh toán dịch vụ khám
            </Button>
          </Card>
        ))}

        {prescriptions.length === 0 && (
          <Card className={styles.emptyCard}>
            <Clock size={44} color="#cbd5e1" />
            <p className={styles.emptyText}>Không có hồ sơ chờ thanh toán</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export { PendingPrescriptions };
export default PendingPrescriptions;