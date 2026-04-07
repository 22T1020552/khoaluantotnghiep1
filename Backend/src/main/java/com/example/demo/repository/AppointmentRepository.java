package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctor_IdAndAppointmentTime(Long doctorId, LocalDateTime appointmentTime);

    boolean existsByDoctor_IdAndAppointmentTimeAndStatusNot(Long doctorId, LocalDateTime appointmentTime, String status);

    boolean existsByDoctor_IdAndAppointmentTimeAndStatusNotIn(
            Long doctorId,
            LocalDateTime appointmentTime,
            Collection<String> statuses
    );

    boolean existsByDoctor_IdAndAppointmentTimeAndIdNot(Long doctorId, LocalDateTime appointmentTime, Long id);

    boolean existsByDoctor_IdAndAppointmentTimeAndIdNotAndStatusNot(
            Long doctorId,
            LocalDateTime appointmentTime,
            Long id,
            String status
    );

    boolean existsByDoctor_IdAndAppointmentTimeAndIdNotAndStatusNotIn(
            Long doctorId,
            LocalDateTime appointmentTime,
            Long id,
            Collection<String> statuses
    );

    @Query("""
    SELECT COUNT(a)
    FROM Appointment a
    WHERE a.doctor.id = :doctorId
      AND a.appointmentTime = :appointmentTime
      AND (:excludedAppointmentId IS NULL OR a.id <> :excludedAppointmentId)
                        AND UPPER(TRIM(COALESCE(a.status, ''))) IN (
                                                'PENDING',
                                                'PENDING_CONFIRMATION',
                                                'DRAFT',
                                                'WAITING',
                                                'IN_PROGRESS',
                                                'APPROVED',
                                                'CONFIRMED'
                        )
    """)
    long countDoctorScheduleConflicts(
            @Param("doctorId") Long doctorId,
            @Param("appointmentTime") LocalDateTime appointmentTime,
            @Param("excludedAppointmentId") Long excludedAppointmentId
    );

    @Query("""
    SELECT COUNT(a)
    FROM Appointment a
    WHERE a.appointmentTime = :appointmentTime
      AND (:excludedAppointmentId IS NULL OR a.id <> :excludedAppointmentId)
      AND UPPER(TRIM(COALESCE(a.status, ''))) IN (
            'PENDING',
            'PENDING_CONFIRMATION',
            'DRAFT',
            'WAITING',
            'IN_PROGRESS',
            'APPROVED',
            'CONFIRMED'
      )
    """)
    long countActiveTimeslotConflicts(
            @Param("appointmentTime") LocalDateTime appointmentTime,
            @Param("excludedAppointmentId") Long excludedAppointmentId
    );

    List<Appointment> findByStatusOrderByAppointmentTimeAsc(String status);

    List<Appointment> findByStatusInOrderByAppointmentTimeAsc(Collection<String> statuses);

    List<Appointment> findByDoctor_Id(Long doctorId);

    List<Appointment> findByDoctor_IdAndStatusOrderByAppointmentTimeAsc(Long doctorId, String status);

    List<Appointment> findByDoctor_IdAndStatusAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
            Long doctorId,
            String status,
            LocalDateTime from,
            LocalDateTime to
    );

    List<Appointment> findByPatientId(Long patientId);

    boolean existsByPatient_IdNotAndAppointmentTimeAndDoctorIsNotNullAndStatusNotIn(
            Long patientId,
            LocalDateTime appointmentTime,
            Collection<String> statuses
    );

    List<Appointment> findByPatient_IdOrderByAppointmentTimeDesc(Long patientId);

        List<Appointment> findByPatient_IdAndStatusNotInOrderByAppointmentTimeDesc(Long patientId, Collection<String> statuses);

    List<Appointment> findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(LocalDateTime from, LocalDateTime to);

    long countByAppointmentTimeBetween(LocalDateTime from, LocalDateTime to);

    long countByStatus(String status);

    @Query("""
    SELECT COUNT(a)
    FROM Appointment a
    WHERE MONTH(a.appointmentTime) = :month
    AND YEAR(a.appointmentTime) = :year
    """)
    long countByMonth(int month, int year);

    @Query("""
    SELECT a.doctor.id, COUNT(a)
    FROM Appointment a
    WHERE a.doctor IS NOT NULL
    GROUP BY a.doctor.id
    ORDER BY COUNT(a) DESC
    """)
    List<Object[]> findTopDoctors();
}
