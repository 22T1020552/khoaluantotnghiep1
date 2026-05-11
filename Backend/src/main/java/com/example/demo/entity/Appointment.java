package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "APPOINTMENTS")
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MANY appointments → 1 patient
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    // MANY appointments → 1 user(role=DOCTOR)
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Column(name = "appointment_time")
    private LocalDateTime appointmentTime;

    // PENDING, WAITING, IN_PROGRESS, COMPLETED
    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "symptoms", length = 500)
    private String symptoms;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;
}
