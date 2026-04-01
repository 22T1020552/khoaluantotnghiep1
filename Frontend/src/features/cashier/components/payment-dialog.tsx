import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Pill } from "lucide-react";
import { Prescription } from "@/types/pharmacy.type";
import styles from "../cashier.module.css";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
  paymentData: { serviceFee: string; insuranceDiscount: string };
  onPaymentDataChange: (field: string, value: string) => void;
  onConfirm: () => void;
}

function PaymentDialog({
  isOpen,
  onOpenChange,
  prescription,
  paymentData,
  onPaymentDataChange,
  onConfirm
}: PaymentDialogProps) {
  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Thanh toán viện phí - {prescription.patientName}</DialogTitle>
        </DialogHeader>

        <div className={styles.dialogBody}>
          <div className={styles.patientInfoBox}>
            <div className={styles.patientInfoGrid}>
              <div><span className={styles.infoLabel}>Bệnh nhân:</span><span className={styles.infoValue}>{prescription.patientName}</span></div>
              <div><span className={styles.infoLabel}>SĐT:</span><span className={styles.infoValue}>{prescription.phone}</span></div>
              <div><span className={styles.infoLabel}>Bác sĩ:</span><span className={styles.infoValue}>{prescription.doctor}</span></div>
              {prescription.insuranceNumber && (
                <div><span className={styles.infoLabel}>BHYT:</span><span className={styles.infoValue}>{prescription.insuranceNumber}</span></div>
              )}
            </div>
          </div>

          <div className={styles.dialogPrescriptionBox}>
            <p className={styles.dialogPrescriptionTitle}>
              <Pill size={14} /> Chi tiết đơn thuốc:
            </p>
            <div className={styles.dialogItems}>
              {prescription.prescriptionItems.map((item, idx) => (
                <div key={idx} className={styles.dialogItem}>
                  <div className={styles.dialogItemTop}>
                    <span className={styles.dialogItemName}>{item.medicationName} <span className={styles.itemDosage}>{item.dosage}</span></span>
                    <span className={styles.dialogItemAmount}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className={styles.dialogItemMeta}>
                    {item.quantity} {item.unit} × {item.price.toLocaleString("vi-VN")}đ
                  </div>
                  <div className={styles.dialogItemUsage}>{item.usage}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formStack}>
            <div>
              <Label>Tiền thuốc (tự động tính)</Label>
              <Input value={`${prescription.totalMedicationCost.toLocaleString("vi-VN")}đ`} disabled className={styles.readonlyInput} />
            </div>
            <div>
              <Label>Phí khám</Label>
              <Input
                type="number"
                value={paymentData.serviceFee}
                onChange={(e) => onPaymentDataChange("serviceFee", e.target.value)}
              />
            </div>
            <div>
              <Label>
                Giảm trừ BHYT
                {prescription.insuranceNumber && <span className={styles.discountHint}>(Tự động tính 70%)</span>}
              </Label>
              <Input
                type="number"
                value={paymentData.insuranceDiscount}
                onChange={(e) => onPaymentDataChange("insuranceDiscount", e.target.value)}
              />
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}><span className={styles.summaryMuted}>Tiền thuốc:</span><span className={styles.amountValue}>{prescription.totalMedicationCost.toLocaleString("vi-VN")}đ</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryMuted}>Phí khám:</span><span className={styles.amountValue}>{parseFloat(paymentData.serviceFee || "0").toLocaleString("vi-VN")}đ</span></div>
                {paymentData.insuranceDiscount && parseFloat(paymentData.insuranceDiscount) > 0 && (
                  <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                    <span>Giảm trừ BHYT (70%):</span><span className={styles.amountValue}>-{parseFloat(paymentData.insuranceDiscount).toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span className={styles.summaryTotalLabel}>Tổng cộng:</span>
                  <span className={styles.summaryTotalValue}>
                    {(
                      prescription.totalMedicationCost +
                      parseFloat(paymentData.serviceFee || "0") -
                      parseFloat(paymentData.insuranceDiscount || "0")
                    ).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.dialogActions}>
            <Button onClick={onConfirm} className={styles.confirmBtn}>
              <DollarSign size={18} />
              Xác nhận thanh toán
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className={styles.cancelBtn}>
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { PaymentDialog };
export default PaymentDialog;