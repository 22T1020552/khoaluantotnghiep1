import { api } from "./api";

export interface CashierWaitingPaymentItemResponse {
  invoiceId: number;
  medicalRecordId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  appointmentTime: string;
  totalAmount: number;
  paymentStatus: string;
}

export interface CashierServiceLineItemResponse {
  serviceId: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CashierMedicineLineItemResponse {
  medicineId: number;
  medicineName: string;
  quantity: number;
  usageInstructions: string;
  unitPrice: number;
  lineTotal: number;
}

export interface CashierPaymentRecordDetailResponse {
  invoiceId: number;
  medicalRecordId: number;
  patientId: number;
  patientName: string;
  phoneNumber: string;
  appointmentTime: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  totalServiceFee: number;
  totalMedicineFee: number;
  totalAmount: number;
  services: CashierServiceLineItemResponse[];
  medicines: CashierMedicineLineItemResponse[];
}

export interface CashierTransactionHistoryItemResponse {
  invoiceId: number;
  medicalRecordId: number;
  patientId: number;
  patientName: string;
  paymentMethod: string;
  paidAt: string;
  totalAmount: number;
}

export interface CashierTransactionHistoryResponse {
  startTime: string;
  endTime: string;
  paymentMethodFilter: string;
  totalTransactions: number;
  totalAmount: number;
  totalCash: number;
  totalBankTransfer: number;
  totalPos: number;
  transactions: CashierTransactionHistoryItemResponse[];
}

export type CashierPaymentMethod = "TIEN_MAT" | "CHUYEN_KHOAN" | "POS";

export interface CashierProcessPaymentRequest {
  paymentMethod: CashierPaymentMethod;
  paymentSuccessful: boolean;
  exportInvoice: boolean;
  applyHealthInsurance: boolean;
}

export interface CashierProcessPaymentResponse {
  invoiceId: number;
  medicalRecordId: number;
  paymentMethod: string;
  totalServiceFee: number;
  totalMedicineFee: number;
  grossTotalAmount: number;
  insuranceDiscountAmount: number;
  totalAmount: number;
  insuranceApplied: boolean;
  paidAt: string;
  transactionStatus: string;
  invoiceExported: boolean;
  invoiceCode: string;
  message: string;
}

export const cashierService = {
  async getWaitingPaymentQueue(keyword?: string) {
    const response = await api.get<CashierWaitingPaymentItemResponse[]>("/api/cashier/payment-queue", {
      params: keyword?.trim() ? { keyword: keyword.trim() } : undefined,
    });
    return response.data;
  },

  async searchPaymentRecord(keyword: string) {
    const response = await api.get<CashierPaymentRecordDetailResponse>("/api/cashier/payment-records/search", {
      params: { keyword },
    });
    return response.data;
  },

  async getPaidInvoiceDetail(invoiceId: number) {
    const response = await api.get<CashierPaymentRecordDetailResponse>(`/api/cashier/invoices/${invoiceId}/paid-detail`);
    return response.data;
  },

  async getTransactionHistory(params?: { startTime?: string; endTime?: string; paymentMethod?: string }) {
    const response = await api.get<CashierTransactionHistoryResponse>("/api/cashier/transaction-history", {
      params,
    });
    return response.data;
  },

  async processPayment(invoiceId: number, payload: CashierProcessPaymentRequest) {
    const response = await api.post<CashierProcessPaymentResponse>(`/api/cashier/invoices/${invoiceId}/process-payment`, payload);
    return response.data;
  },

  async exportInvoicePdf(invoiceId: number) {
    const response = await api.get<Blob>(`/api/cashier/invoices/${invoiceId}/export-pdf`, {
      responseType: "blob",
    });
    return response.data;
  },
};
