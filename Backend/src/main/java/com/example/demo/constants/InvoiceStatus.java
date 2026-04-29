package com.example.demo.constants;

public final class InvoiceStatus {

    public static final String WAITING_PAYMENT = "CHO_THANH_TOAN";
    public static final String PAID = "DA_THANH_TOAN";

    private InvoiceStatus() {
        throw new IllegalStateException("Utility class");
    }
}
