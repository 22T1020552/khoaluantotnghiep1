import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Prescription } from "@/types/pharmacy.type";
import styles from "../cashier.module.css";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    amount,
  );

const normalizeServiceName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const isConsultationServiceName = (serviceName?: string | null) => {
  if (!serviceName) {
    return false;
  }

  const normalized = normalizeServiceName(serviceName);
  return ["kham", "consultation", "examination", "tu van"].some((keyword) =>
    normalized.includes(keyword),
  );
};

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
            {(() => {
              const serviceItems = prescription.serviceItems ?? [];
              const totalServiceFee = prescription.serviceFee ?? 0;
              const consultationServices = serviceItems.filter((item) => isConsultationServiceName(item.serviceName));
              const additionalServices = serviceItems.filter((item) => !isConsultationServiceName(item.serviceName));
              const consultationFee =
                consultationServices.length > 0
                  ? consultationServices.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
                  : totalServiceFee;
              const additionalServiceFee = additionalServices.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);

              return (
                <>
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
                    {serviceItems.length > 0 && consultationFee > 0 ? (
                      <>
                        <div className={`${styles.amountRow} ${styles.amountBorder}`}>
                          <span className={styles.amountLabel}>Phí khám ban đầu:</span>
                          <span className={styles.amountValue}>{formatCurrency(consultationFee)}</span>
                        </div>
                        {consultationServices.map((item) => (
                          <div key={`consult-${item.serviceId}`} className={styles.amountRow}>
                            <span className={styles.amountLabel}>- {item.serviceName}</span>
                            <span className={styles.amountValue}>{formatCurrency(item.lineTotal)}</span>
                          </div>
                        ))}
                        {additionalServiceFee > 0 && (
                          <>
                            <div className={styles.amountRow}>
                              <span className={styles.amountLabel}>Dịch vụ chỉ định thêm:</span>
                              <span className={styles.amountValue}>{formatCurrency(additionalServiceFee)}</span>
                            </div>
                            {additionalServices.map((item) => (
                              <div key={`additional-${item.serviceId}`} className={styles.amountRow}>
                                <span className={styles.amountLabel}>- {item.serviceName}</span>
                                <span className={styles.amountValue}>{formatCurrency(item.lineTotal)}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <div className={styles.amountRow}>
                        <span className={styles.amountLabel}>Phí khám:</span>
                        <span className={styles.amountValue}>
                          {formatCurrency(totalServiceFee)}
                        </span>
                      </div>
                    )}
                    {prescription.insuranceDiscount && prescription.insuranceDiscount > 0 && (
                      <div className={`${styles.amountRow} ${styles.discountRow}`}>
                        <span>Giảm trừ BHYT:</span>
                        <span className={styles.amountValue}>
                          -{formatCurrency(prescription.insuranceDiscount)}
                        </span>
                      </div>
                    )}
                    <div className={`${styles.amountRow} ${styles.totalRow}`}>
                      <span className={styles.totalLabel}>Tổng cộng:</span>
                      <span className={styles.totalValue}>
                        {formatCurrency(prescription.grandTotal ?? prescription.totalAmount ?? totalServiceFee)}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        ))}

        {prescriptions.length === 0 && (
          <Card className={styles.emptyCard}>
            <CheckCircle size={44} color="#cbd5e1" />
            <p className={styles.emptyText}>Chưa có hồ sơ được thanh toán</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export { DispensedPrescriptions };
export default DispensedPrescriptions;