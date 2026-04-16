"use client";

import { useCallback, useMemo, useState } from "react";

import { isForbiddenError } from "@/services/api";
import { receptionistService, type ReceptionistAppointment, type ReceptionistDoctorOption } from "@/services/receptionistService";

export function useReceptionistDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState<ReceptionistAppointment[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<ReceptionistAppointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<ReceptionistAppointment[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<ReceptionistDoctorOption[]>([]);
  const [pendingForbidden, setPendingForbidden] = useState(false);
  const [confirmedForbidden, setConfirmedForbidden] = useState(false);
  const [doctorsForbidden, setDoctorsForbidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
    const [pendingResult, confirmedResult, cancelledResult, doctorsResult] = await Promise.allSettled([
        receptionistService.getPendingAppointments(),
        receptionistService.getConfirmedAppointments(),
      receptionistService.getCancelledAppointments(),
        receptionistService.getDoctors(),
      ]);

      const nonForbiddenErrors: unknown[] = [];

      if (pendingResult.status === "fulfilled") {
        setPendingAppointments(pendingResult.value);
        setPendingForbidden(false);
      } else if (isForbiddenError(pendingResult.reason)) {
        setPendingAppointments([]);
        setPendingForbidden(true);
      } else {
        nonForbiddenErrors.push(pendingResult.reason);
      }

      if (confirmedResult.status === "fulfilled") {
        setConfirmedAppointments(confirmedResult.value);
        setConfirmedForbidden(false);
      } else if (isForbiddenError(confirmedResult.reason)) {
        setConfirmedAppointments([]);
        setConfirmedForbidden(true);
      } else {
        nonForbiddenErrors.push(confirmedResult.reason);
      }

      if (cancelledResult.status === "fulfilled") {
        setCancelledAppointments(cancelledResult.value);
      } else if (isForbiddenError(cancelledResult.reason)) {
        setCancelledAppointments([]);
      } else {
        nonForbiddenErrors.push(cancelledResult.reason);
      }

      if (doctorsResult.status === "fulfilled") {
        setDoctorOptions(doctorsResult.value);
        setDoctorsForbidden(false);
      } else if (isForbiddenError(doctorsResult.reason)) {
        setDoctorOptions([]);
        setDoctorsForbidden(true);
      } else {
        nonForbiddenErrors.push(doctorsResult.reason);
      }

      if (nonForbiddenErrors.length > 0) {
        throw nonForbiddenErrors[0];
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalCount = useMemo(() => {
    const idSet = new Set<number>();
    pendingAppointments.forEach((item) => idSet.add(item.id));
    confirmedAppointments.forEach((item) => idSet.add(item.id));
    cancelledAppointments.forEach((item) => idSet.add(item.id));
    return idSet.size;
  }, [pendingAppointments, confirmedAppointments, cancelledAppointments]);

  return {
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    doctorOptions,
    pendingForbidden,
    confirmedForbidden,
    doctorsForbidden,
    totalCount,
    isLoading,
    loadDashboardData,
  };
}
