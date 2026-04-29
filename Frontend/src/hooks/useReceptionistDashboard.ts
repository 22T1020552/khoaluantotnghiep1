"use client";

import { useCallback, useMemo, useState } from "react";

import { receptionistService, type ReceptionistAppointment, type ReceptionistDoctorOption } from "@/services/receptionistService";

export function useReceptionistDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState<ReceptionistAppointment[]>([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState<ReceptionistAppointment[]>([]);
<<<<<<< HEAD
=======
  const [cancelledAppointments, setCancelledAppointments] = useState<ReceptionistAppointment[]>([]);
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  const [doctorOptions, setDoctorOptions] = useState<ReceptionistDoctorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      const [pendingData, confirmedData, doctors] = await Promise.all([
        receptionistService.getPendingAppointments(),
        receptionistService.getConfirmedAppointments(),
=======
      const [pendingData, confirmedData, cancelledData, doctors] = await Promise.all([
        receptionistService.getPendingAppointments(),
        receptionistService.getConfirmedAppointments(),
        receptionistService.getCancelledAppointments().catch(() => []),
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
        receptionistService.getDoctors(),
      ]);

      setPendingAppointments(pendingData);
      setConfirmedAppointments(confirmedData);
<<<<<<< HEAD
=======
      setCancelledAppointments(cancelledData);
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
      setDoctorOptions(doctors);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalCount = useMemo(() => {
    const idSet = new Set<number>();
    pendingAppointments.forEach((item) => idSet.add(item.id));
    confirmedAppointments.forEach((item) => idSet.add(item.id));
<<<<<<< HEAD
    return idSet.size;
  }, [pendingAppointments, confirmedAppointments]);
=======
    cancelledAppointments.forEach((item) => idSet.add(item.id));
    return idSet.size;
  }, [pendingAppointments, confirmedAppointments, cancelledAppointments]);
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6

  return {
    pendingAppointments,
    confirmedAppointments,
<<<<<<< HEAD
=======
    cancelledAppointments,
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
    doctorOptions,
    totalCount,
    isLoading,
    loadDashboardData,
  };
}
