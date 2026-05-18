import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { Prescription } from "@/types/pharmacy.type";
import styles from "../cashier.module.css";

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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    amount,
  );

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
  paymentData: { serviceFee: string; insuranceDiscount: string };
  onPaymentDataChange: (field: string, value: string) => void;
  paymentMethod: "TIEN_MAT" | "CHUYEN_KHOAN" | "POS";
  onPaymentMethodChange: (value: "TIEN_MAT" | "CHUYEN_KHOAN" | "POS") => void;
  transferConfirmed: boolean;
  onTransferConfirmedChange: (value: boolean) => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

function PaymentDialog({
  isOpen,
  onOpenChange,
  prescription,
  paymentData,
  onPaymentDataChange,
  paymentMethod,
  onPaymentMethodChange,
  transferConfirmed,
  onTransferConfirmedChange,
  onConfirm,
  isProcessing = false,
}: PaymentDialogProps) {
  if (!prescription) return null;

  const serviceItems = prescription.serviceItems ?? [];
  const totalServiceFee = parseFloat(paymentData.serviceFee || "0");
  const consultationServices = serviceItems.filter((item) => isConsultationServiceName(item.serviceName));
  const additionalServices = serviceItems.filter((item) => !isConsultationServiceName(item.serviceName));
  const consultationFee =
    consultationServices.length > 0
      ? consultationServices.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
      : totalServiceFee;
  const additionalServiceFee = additionalServices.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const insuranceDiscount = parseFloat(paymentData.insuranceDiscount || "0");
  const remainingAmount = prescription.remainingAmount ?? null;
  const payableAmount = remainingAmount !== null
    ? remainingAmount
    : Math.max(0, totalServiceFee - insuranceDiscount);

  const bankBin = process.env.NEXT_PUBLIC_CLINIC_BANK_BIN?.trim();
  const bankAccount = process.env.NEXT_PUBLIC_CLINIC_BANK_ACCOUNT?.trim();
  const accountNameRaw = process.env.NEXT_PUBLIC_CLINIC_ACCOUNT_NAME?.trim();
  const bankName = process.env.NEXT_PUBLIC_CLINIC_BANK_NAME?.trim() || "TRAN CAM UYEN";
  const qrReady = Boolean(bankBin && bankAccount && accountNameRaw);
  const accountName = encodeURIComponent(accountNameRaw || "");
  const transferNote = encodeURIComponent(`THANH TOAN HD ${prescription.invoiceId || prescription.id}`);
  const qrUrl = qrReady
    ? `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${Math.round(payableAmount)}&addInfo=${transferNote}&accountName=${accountName}`
    : "";

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

          <div className={styles.formStack}>
            <div>
              <Label>Phí khám</Label>
              <Input
                type="text"
                value={formatCurrency(totalServiceFee)}
                onChange={(e) => onPaymentDataChange("serviceFee", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Phương thức thanh toán</Label>
              <select
                className={styles.selectInput}
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value as "TIEN_MAT" | "CHUYEN_KHOAN" | "POS")}
                disabled={isProcessing}
              >
                <option value="TIEN_MAT">Tiền mặt</option>
                <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                <option value="POS">POS</option>
              </select>
            </div>

            {paymentMethod === "CHUYEN_KHOAN" && (
              <div className={styles.qrBox}>
                <p className={styles.qrTitle}>Quét mã QR để thanh toán</p>
                {qrReady ? (
                  <>
                    <img src={qrUrl} alt="QR chuyển khoản phòng khám" className={styles.qrImage} />
                    <p className={styles.qrAmount}>Số tiền: {Math.round(payableAmount).toLocaleString("vi-VN")}đ</p>
                    <p className={styles.textSmall}>{bankName}</p>
                    <p className={styles.textSmall}>{bankAccount}</p>
                  </>
                ) : (
                  <p className={styles.textDanger}>
                    Thiếu cấu hình QR trong .env. Cần đủ: NEXT_PUBLIC_CLINIC_BANK_BIN,
                    NEXT_PUBLIC_CLINIC_BANK_ACCOUNT, NEXT_PUBLIC_CLINIC_ACCOUNT_NAME
                  </p>
                )}
              </div>
            )}

            {(paymentMethod === "CHUYEN_KHOAN" || paymentMethod === "POS") && (
              <div className={styles.checkboxRow}>
                <input
                  id="transfer-confirmed"
                  type="checkbox"
                  checked={transferConfirmed}
                  onChange={(e) => onTransferConfirmedChange(e.target.checked)}
                />
                <Label htmlFor="transfer-confirmed">
                  {paymentMethod === "CHUYEN_KHOAN"
                    ? "Đã nhận chuyển khoản thành công"
                    : "Đã quẹt thẻ POS thành công"}
                </Label>
              </div>
            )}

            <div>
              <Label>
                Giảm trừ BHYT
                {prescription.insuranceNumber && <span className={styles.discountHint}>(Tự động tính 70%)</span>}
              </Label>
              <Input
                type="number"
                value={paymentData.insuranceDiscount}
                onChange={(e) => onPaymentDataChange("insuranceDiscount", e.target.value)}
                disabled
              />
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryList}>
                {serviceItems.length > 0 && consultationFee > 0 ? (
                  <>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryMuted}>Phí khám ban đầu:</span>
                      <span className={styles.amountValue}>{formatCurrency(consultationFee)}</span>
                    </div>
                    {consultationServices.map((item) => (
                      <div key={`consult-${item.serviceId}`} className={styles.summaryRow}>
                        <span className={styles.summaryMuted}>- {item.serviceName}</span>
                        <span className={styles.amountValue}>{formatCurrency(item.lineTotal)}</span>
                      </div>
                    ))}
                    {additionalServiceFee > 0 && (
                      <>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryMuted}>Dịch vụ chỉ định thêm:</span>
                          <span className={styles.amountValue}>{formatCurrency(additionalServiceFee)}</span>
                        </div>
                        {additionalServices.map((item) => (
                          <div key={`additional-${item.serviceId}`} className={styles.summaryRow}>
                            <span className={styles.summaryMuted}>- {item.serviceName}</span>
                            <span className={styles.amountValue}>{formatCurrency(item.lineTotal)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <div className={styles.summaryRow}><span className={styles.summaryMuted}>Phí khám:</span><span className={styles.amountValue}>{formatCurrency(totalServiceFee)}</span></div>
                )}
                {prescription.advanceAmount && prescription.advanceAmount > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryMuted}>Đã tạm ứng:</span>
                    <span className={styles.amountValue}>-{formatCurrency(prescription.advanceAmount)}</span>
                  </div>
                )}
                {insuranceDiscount > 0 && (
                  <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                    <span>Giảm trừ BHYT (70%):</span><span className={styles.amountValue}>-{formatCurrency(insuranceDiscount)}</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span className={styles.summaryTotalLabel}>Tổng cộng:</span>
                  <span className={styles.summaryTotalValue}>
                    {formatCurrency(payableAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.dialogActions}>
            <Button onClick={onConfirm} className={styles.confirmBtn} disabled={isProcessing}>
              <DollarSign size={18} />
              {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className={styles.cancelBtn} disabled={isProcessing}>
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