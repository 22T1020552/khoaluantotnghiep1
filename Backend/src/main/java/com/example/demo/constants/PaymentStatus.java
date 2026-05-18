package com.example.demo.constants;

public final class PaymentStatus {

    public static final String UNPAID = "UNPAID";
    public static final String PARTIALLY_PAID = "PARTIALLY_PAID";
    public static final String FULLY_PAID = "FULLY_PAID";

    private PaymentStatus() {
        throw new IllegalStateException("Utility class");
    }
}
