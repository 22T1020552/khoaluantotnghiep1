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
      const [pendingData, confirmedData, doctors] = await Promise.all([
        receptionistService.getPendingAppointments(),
        receptionistService.getConfirmedAppointments(),
        receptionistService.getDoctors(),
      ]);

      setPendingAppointments(pendingData);
      setConfirmedAppointments(confirmedData);
      setDoctorOptions(doctors);
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
