package com.example.demo.constants;

public final class AppointmentStatus {

    public static final String PENDING_CONFIRMATION = "PENDING";
    public static final String WAITING = "WAITING";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";
    public static final String CANCELLED_BY_CLINIC = "CANCELLED_BY_CLINIC";

    private AppointmentStatus() {
        throw new IllegalStateException("Utility class");
    }
}
