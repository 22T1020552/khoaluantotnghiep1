"use client";

import { useCallback, useMemo, useState } from "react";

import { receptionistService, type ReceptionistAppointment, type ReceptionistDoctorOption } from "@/services/receptionistService";

export function useReceptionistDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState<ReceptionistAppointment[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<ReceptionistAppointment[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<ReceptionistDoctorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingResult, confirmedResult, doctorsResult] = await Promise.allSettled([
        receptionistService.getPendingAppointments(),
        receptionistService.getConfirmedAppointments(),
        receptionistService.getDoctors(),
      ]);

      setPendingAppointments(pendingResult.status === "fulfilled" ? pendingResult.value : []);
      setConfirmedAppointments(confirmedResult.status === "fulfilled" ? confirmedResult.value : []);
      setDoctorOptions(doctorsResult.status === "fulfilled" ? doctorsResult.value : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalCount = useMemo(() => {
    const idSet = new Set<number>();
    pendingAppointments.forEach((item) => idSet.add(item.id));
    confirmedAppointments.forEach((item) => idSet.add(item.id));
    return idSet.size;
  }, [pendingAppointments, confirmedAppointments]);

  return {
    pendingAppointments,
    confirmedAppointments,
    doctorOptions,
    totalCount,
    isLoading,
    loadDashboardData,
  };
}
