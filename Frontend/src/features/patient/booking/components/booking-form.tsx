'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/services/api";
import { patientService } from "@/services/patientService";
import { masterDataService, type SymptomTemplateResponse } from "@/services/masterDataService";
import { Calendar, CreditCard, FileText, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import styles from "../booking.module.css";

// Định nghĩa props để truyền sự kiện ra ngoài component cha
interface BookingFormProps {
  onSuccess: (appointmentId: number) => void;
}
//Hàm chuẩn hóa thời gian để backend hiểu được
const toApiDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return normalized;
  }

  // Backend: yyyy-MM-dd'T'HH:mm:ss.
  if (normalized.length === 16) {
    return `${normalized}:00`;
  }

  return normalized;
};

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [estimatingFee, setEstimatingFee] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    hometown: "",
    phone: "",
    idNumber: "",
    insuranceNumber: "",
    appointmentTime: "",
    reason: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"TIEN_MAT" | "CHUYEN_KHOAN">("CHUYEN_KHOAN");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomTemplateResponse[]>([]);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<number[]>([]);
  const [estimatedTotalFee, setEstimatedTotalFee] = useState<number | null>(null);
  const [estimatedServices, setEstimatedServices] = useState<
    {
      serviceId: number;
      serviceName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[]
  >([]);

  const formatCurrency = (value: number | null) => {
    if (value == null) {
      return "0đ";
    }
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await patientService.getProfile(); //Lấy thông tin của mình
        if (!isMounted) {
          return;
        }
        // Điền thông tin vào form nếu có
        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName ?? "",
          gender: profile.gender ?? "",
          phone: profile.phoneNumber ?? "",
          idNumber: profile.nationalId ?? "",
          insuranceNumber: profile.healthInsuranceNumber ?? "",
        }));
      } catch {
        // Do not block form usage when profile API fails.
      }
    };

    const loadCategoriesAndSymptoms = async () => {
      try {
        const cats = await masterDataService.getCategories();
        if (!isMounted) return;
        setCategories(cats.map(c => ({ id: c.id, name: c.name })));
        if (cats.length > 0) {
          const firstId = cats[0].id;
          setSelectedCategoryId(firstId);
          try {
            const s = await masterDataService.getSymptomsByCategory(firstId);
            if (!isMounted) return;
            setSymptoms(s);
          } catch {
            if (!isMounted) return;
            setSymptoms([]);
          }
        } else {
          setSymptoms([]);
        }
      } catch {
        if (!isMounted) return;
        setSymptoms([]);
      }
    };

    void loadProfile();
    void loadCategoriesAndSymptoms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedCategoryId == null) return;
    let mounted = true;
    const load = async () => {
      try {
        const s = await masterDataService.getSymptomsByCategory(selectedCategoryId);
        if (!mounted) return;
        setSymptoms(s);
      } catch {
        if (!mounted) return;
        setSymptoms([]);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedSymptomIds.length === 0) {
      setEstimatedTotalFee(null);
      setEstimatedServices([]);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        setEstimatingFee(true);
        const result = await patientService.estimateAppointmentFee(selectedSymptomIds);
        if (!mounted) return;
        setEstimatedTotalFee(Number(result.estimatedTotalFee ?? 0));
        setEstimatedServices(result.services ?? []);
      } catch {
        if (!mounted) return;
        setEstimatedTotalFee(null);
        setEstimatedServices([]);
      } finally {
        if (mounted) {
          setEstimatingFee(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [selectedSymptomIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCustomReason = formData.reason.trim();

    if (!formData.fullName || !formData.gender || !formData.phone || !formData.appointmentTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (selectedCategoryId == null) {
      toast.error("Vui lòng chọn nhóm triệu chứng");
      return;
    }
    if (selectedSymptomIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một triệu chứng");
      return;
    }
    //Gói dữ liệu và gửi lên backend
    try {
      setSubmitting(true);
      // Gom các triệu chứng đã chọn và mô tả tùy chỉnh (nếu có)
      const selectedSymptomNames = symptoms
        .filter((symptom) => selectedSymptomIds.includes(symptom.id))
        .map((symptom) => symptom.symptomName);

      const symptomsForApi = selectedSymptomNames.join(' | ')
        + (normalizedCustomReason ? ' - ' + normalizedCustomReason : '');

      const createdAppointment = await patientService.createAppointment({
        appointmentTime: toApiDateTime(formData.appointmentTime),
        categoryId: selectedCategoryId,
        symptomIds: selectedSymptomIds,
        paymentMethod,
        symptoms: symptomsForApi,
      });
      // Gọi callback để thông báo cho component cha biết đã tạo thành công và truyền ID của lịch hẹn mới tạo
      onSuccess(createdAppointment.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể đặt lịch khám"));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSymptomsCount = selectedSymptomIds.length;
  const estimatedTransferAmount = Math.max(0, Math.round(estimatedTotalFee ?? 0));
  const bankBin = process.env.NEXT_PUBLIC_CLINIC_BANK_BIN?.trim();
  const bankAccount = process.env.NEXT_PUBLIC_CLINIC_BANK_ACCOUNT?.trim();
  const accountNameRaw = process.env.NEXT_PUBLIC_CLINIC_ACCOUNT_NAME?.trim();
  const bankName = process.env.NEXT_PUBLIC_CLINIC_BANK_NAME?.trim() || "TRAN CAM UYEN";
  const qrReady = Boolean(bankBin && bankAccount && accountNameRaw);
  const transferAccountName = encodeURIComponent(accountNameRaw || "");
  const transferNote = encodeURIComponent(`DAT LICH ${formData.phone || "BENHNHAN"}`);
  const transferQrUrl = qrReady
    ? `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${estimatedTransferAmount}&addInfo=${transferNote}&accountName=${transferAccountName}`
    : "";

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Thông tin cá nhân */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
        </div>
        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <Label htmlFor="fullName">Họ và tên <span className={styles.required}>*</span></Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Giới tính <span className={styles.required}>*</span></Label>
            <select
              id="gender"
              className={styles.selectInput}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Số điện thoại <span className={styles.required}>*</span></Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0123456789"
              required
            />
          </div>
          <div className={styles.fullWidth}>
            <Label htmlFor="hometown">Quê quán</Label>
            <Input
              id="hometown"
              value={formData.hometown}
              onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
              placeholder="Thành phố, Tỉnh"
            />
          </div>
        </div>
        <p className={styles.mutedNote}>
          Thông tin cá nhân được lấy từ hồ sơ bệnh nhân. Bạn có thể chỉnh sửa nếu cần.
        </p>
      </div>

      {/* Giấy tờ tùy thân */}
      <div className={styles.sectionDivider}>
        <div className={styles.sectionHeader}>
          <CreditCard className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Giấy tờ tùy thân</h2>
        </div>
        <div className={styles.grid}>
          <div>
            <Label htmlFor="idNumber">Số CCCD/CMND</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder="001234567890"
            />
          </div>
          <div>
            <Label htmlFor="insuranceNumber">Số thẻ BHYT</Label>
            <Input
              id="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
              placeholder="DN1234567890123"
            />
          </div>
        </div>
      </div>

      {/* Lý do khám */}
      <div className={styles.sectionDivider}>
        <div className={styles.sectionHeader}>
          <FileText className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Thông tin khám bệnh</h2>
        </div>
        <div className={styles.fieldGroup}>
          <Label htmlFor="appointmentTime" className={styles.fieldLabel}>
            Thời gian hẹn <span className={styles.required}>*</span>
          </Label>
          <Input
            id="appointmentTime"
            type="datetime-local"
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <Label className={styles.fieldLabel}>
            Lý do khám / Triệu chứng <span className={styles.required}>*</span>
          </Label>
          <div className={styles.symptomCard}>
            <div className={styles.symptomHeader}>
              <div className={styles.symptomTitleBlock}>
                <span className={styles.symptomTitle}>Chọn triệu chứng có sẵn hoặc nhập mô tả thêm</span>
                <span className={styles.symptomHint}>Chọn nhanh để tiết kiệm thời gian, rồi bổ sung chi tiết nếu cần.</span>
              </div>
              <div className={styles.symptomMeta}>
                <span className={styles.symptomBadge}>{selectedSymptomsCount} đã chọn</span>
                {selectedSymptomsCount > 0 && (
                  <button
                    type="button"
                    className={styles.symptomClearBtn}
                    onClick={() => setSelectedSymptomIds([])}
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>
            </div>

            <div className={styles.symptomRow}>
              <div className={styles.symptomCategory}>
                <Label htmlFor="symptomCategory">Nhóm triệu chứng</Label>
                <select
                  id="symptomCategory"
                  className={styles.selectInput}
                  value={selectedCategoryId ?? ''}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value) || null)}
                >
                  {categories.length === 0 && <option value="">-- Chọn nhóm --</option>}
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.symptomList}>
                {symptoms.map((s) => (
                  <label key={s.id} className={`${styles.symptomChip} ${selectedSymptomIds.includes(s.id) ? styles.symptomChipActive : ""}`}>
                    <input
                      type="checkbox"
                      checked={selectedSymptomIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSymptomIds((prev) => [...prev, s.id]);
                        } else {
                          setSelectedSymptomIds((prev) => prev.filter((x) => x !== s.id));
                        }
                      }}
                    />
                      <span className={styles.symptomChipSpan}>{s.symptomName}</span>
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              id="reason"
              className={styles.reasonTextarea}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Mô tả triệu chứng (nếu không có trong danh sách hoặc cần mô tả thêm)..."
              rows={4}
            />
            <div className={styles.paymentSection}>
              <div className={styles.servicePreview}>
                <div className={styles.servicePreviewTitle}>Dịch vụ dự kiến</div>
                {estimatedServices.length > 0 ? (
                  <ul className={styles.serviceList}>
                    {estimatedServices.map((service) => (
                      <li key={service.serviceId} className={styles.serviceItem}>
                        <span className={styles.serviceName}>{service.serviceName}</span>
                        <span className={styles.servicePrice}>{formatCurrency(service.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.serviceEmpty}>Chọn triệu chứng để xem các dịch vụ khám tương ứng.</p>
                )}
              </div>
              <div className={styles.paymentSummary}>
                <span className={styles.paymentSummaryLabel}>Tổng tiền tạm tính</span>
                <span className={styles.paymentSummaryValue}>
                  {estimatingFee ? "Đang tính..." : formatCurrency(estimatedTotalFee)}
                </span>
              </div>
              <div className={styles.paymentRow}>
                <div className={styles.paymentField}>
                  <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                  <select
                    id="paymentMethod"
                    className={styles.selectInput}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as "TIEN_MAT" | "CHUYEN_KHOAN")}
                  >
                    <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                    <option value="TIEN_MAT">Tiền mặt</option>
                  </select>
                </div>
                <p className={styles.paymentNote}>
                  Phí ước tính được tính từ các dịch vụ gắn với triệu chứng đã chọn.
                </p>

                {paymentMethod === "CHUYEN_KHOAN" && (
                  <div className={styles.paymentQrBox}>
                    <p className={styles.paymentQrTitle}>Quét mã QR để thanh toán</p>
                    {qrReady ? (
                      <>
                        <img src={transferQrUrl} alt="QR thanh toán đặt lịch" className={styles.paymentQrImage} />
                        <p className={styles.paymentQrAmount}>
                          Số tiền tạm tính: {estimatedTransferAmount.toLocaleString("vi-VN")}đ
                        </p>
                        <p className={styles.paymentQrMeta}>{bankName}</p>
                        <p className={styles.paymentQrMeta}>{bankAccount}</p>
                      </>
                    ) : (
                      <p className={styles.paymentQrError}>
                        Thiếu cấu hình QR trong .env. Cần đủ: NEXT_PUBLIC_CLINIC_BANK_BIN,
                        NEXT_PUBLIC_CLINIC_BANK_ACCOUNT, NEXT_PUBLIC_CLINIC_ACCOUNT_NAME
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className={styles.mutedNote}>
              Chọn các triệu chứng có sẵn để điền nhanh. Hoặc mô tả chi tiết nếu cần. Nếu chọn triệu chứng, bạn có thể để mô tả trống.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" className={styles.submitBtn} size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Calendar className="w-5 h-5 mr-2" />}
          {submitting ? "Đang gửi..." : "Đặt lịch khám"}
        </Button>
      </div>
    </form>
  );
}