"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/services/api";
import { adminService, type AdminRoom, type AdminRoomSchedule, type AdminUser } from "@/services/adminService";
import styles from "../admin.module.css";

type RoomModalMode = "create" | "edit" | "assign";
type ScheduleModalMode = "create" | "edit";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function RoomsManagement() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [schedules, setSchedules] = useState<AdminRoomSchedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<RoomModalMode>("create");
  const [selectedRoom, setSelectedRoom] = useState<AdminRoom | null>(null);
  const [roomName, setRoomName] = useState("");
  const [doctorId, setDoctorId] = useState<number | "">("");

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalMode, setScheduleModalMode] = useState<ScheduleModalMode>("create");
  const [selectedSchedule, setSelectedSchedule] = useState<AdminRoomSchedule | null>(null);
  const [scheduleRoomId, setScheduleRoomId] = useState<number | "">("");
  const [scheduleDoctorId, setScheduleDoctorId] = useState<number | "">("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, usersData] = await Promise.all([adminService.getRooms(), adminService.getUsers()]);
      setRooms(roomsData);
      setDoctors(usersData.filter((user) => user.role === "DOCTOR" && user.isActive));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải dữ liệu phòng khám"));
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (monthValue: string) => {
    try {
      setScheduleLoading(true);
      const data = await adminService.getRoomSchedules({ month: monthValue });
      setSchedules(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải lịch phân công"));
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      void loadSchedules(selectedMonth);
    }
  }, [selectedMonth]);

  const busyRoomIds = useMemo(() => {
    return new Set<number>(rooms.filter((room) => room.currentDoctorId != null).map((room) => room.id));
  }, [rooms]);

  const monthRange = useMemo(() => {
    if (!selectedMonth) {
      return null;
    }

    const [yearValue, monthValue] = selectedMonth.split("-");
    const year = Number(yearValue);
    const month = Number(monthValue);
    if (!year || !month) {
      return null;
    }

    const lastDay = new Date(year, month, 0).getDate();
    return {
      start: `${selectedMonth}-01`,
      end: `${selectedMonth}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [selectedMonth]);

  const scheduleByDate = useMemo(() => {
    const map = new Map<string, AdminRoomSchedule[]>();
    schedules.forEach((schedule) => {
      if (!map.has(schedule.scheduleDate)) {
        map.set(schedule.scheduleDate, []);
      }
      map.get(schedule.scheduleDate)?.push(schedule);
    });

    map.forEach((list) => {
      list.sort((left, right) => left.startTime.localeCompare(right.startTime));
    });

    return map;
  }, [schedules]);

  const calendarCells = useMemo(() => {
    if (!selectedMonth) {
      return [] as Array<string | null>;
    }

    const [yearValue, monthValue] = selectedMonth.split("-");
    const year = Number(yearValue);
    const monthIndex = Number(monthValue) - 1;
    if (!year || monthIndex < 0) {
      return [] as Array<string | null>;
    }

    const firstDay = new Date(year, monthIndex, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: Array<string | null> = [];
    for (let i = 0; i < offset; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(`${selectedMonth}-${String(day).padStart(2, "0")}`);
    }
    return cells;
  }, [selectedMonth]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedRoom(null);
    setRoomName("");
    setDoctorId("");
    setIsModalOpen(true);
  };

  const openEditModal = (room: AdminRoom) => {
    setModalMode("edit");
    setSelectedRoom(room);
    setRoomName(room.roomName);
    setDoctorId("");
    setIsModalOpen(true);
  };

  const openAssignModal = (room: AdminRoom) => {
    setModalMode("assign");
    setSelectedRoom(room);
    setRoomName(room.roomName);
    setDoctorId(room.currentDoctorId ?? "");
    setIsModalOpen(true);
  };

  const openScheduleModal = (mode: ScheduleModalMode, schedule?: AdminRoomSchedule) => {
    setScheduleModalMode(mode);
    setSelectedSchedule(schedule ?? null);

    if (schedule) {
      setScheduleRoomId(schedule.roomId);
      setScheduleDoctorId(schedule.doctorId);
      setScheduleDate(schedule.scheduleDate);
      setScheduleStartTime(schedule.startTime);
      setScheduleEndTime(schedule.endTime);
    } else {
      setScheduleRoomId("");
      setScheduleDoctorId("");
      setScheduleDate(monthRange?.start ?? new Date().toISOString().slice(0, 10));
      setScheduleStartTime("08:00");
      setScheduleEndTime("09:00");
    }

    setIsScheduleModalOpen(true);
  };

  const closeModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
    }
  };

  const closeScheduleModal = () => {
    if (!scheduleSubmitting) {
      setIsScheduleModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (modalMode === "assign") {
      if (!selectedRoom) {
        return;
      }
      if (!doctorId) {
        toast.error("Vui lòng chọn bác sĩ");
        return;
      }

      try {
        setSubmitting(true);
        await adminService.assignDoctorToRoom(selectedRoom.id, Number(doctorId));
        toast.success("Đã phân công bác sĩ vào phòng");
        setIsModalOpen(false);
        await loadData();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Không thể phân công bác sĩ"));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!roomName.trim()) {
      toast.error("Vui lòng nhập tên phòng");
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === "create") {
        await adminService.createRoom(roomName.trim());
        toast.success("Đã thêm phòng khám");
      } else if (selectedRoom) {
        await adminService.updateRoom(selectedRoom.id, roomName.trim());
        toast.success("Đã cập nhật phòng khám");
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể lưu phòng khám"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleRoomId || !scheduleDoctorId) {
      toast.error("Vui lòng chọn phòng và bác sĩ");
      return;
    }

    if (!scheduleDate) {
      toast.error("Vui lòng chọn ngày");
      return;
    }

    if (!scheduleStartTime || !scheduleEndTime) {
      toast.error("Vui lòng chọn giờ bắt đầu và kết thúc");
      return;
    }

    if (scheduleEndTime <= scheduleStartTime) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    const payload = {
      roomId: Number(scheduleRoomId),
      doctorId: Number(scheduleDoctorId),
      scheduleDate,
      timeSlot: `${scheduleStartTime}-${scheduleEndTime}`,
    };

    try {
      setScheduleSubmitting(true);
      if (scheduleModalMode === "create") {
        await adminService.createRoomSchedule(payload);
        toast.success("Đã tạo lịch phân công");
      } else if (selectedSchedule) {
        await adminService.updateRoomSchedule(selectedSchedule.id, payload);
        toast.success("Đã cập nhật lịch phân công");
      }
      setIsScheduleModalOpen(false);
      if (selectedMonth) {
        await loadSchedules(selectedMonth);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể lưu lịch phân công"));
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (schedule: AdminRoomSchedule) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa lịch phân công này?");
    if (!confirmed) {
      return;
    }

    try {
      await adminService.deleteRoomSchedule(schedule.id);
      toast.success("Đã xóa lịch phân công");
      if (selectedMonth) {
        await loadSchedules(selectedMonth);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể xóa lịch phân công"));
    }
  };

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Quản lý phòng khám</h1>
          <p>Quản lý phòng khám và phân công bác sĩ theo lịch tháng.</p>
        </div>

        <div className={styles.toolbar}>
          <button type="button" className={styles.primaryButton} onClick={openCreateModal}>
            <Plus size={16} /> Thêm phòng khám
          </button>
        </div>

        {loading ? (
          <section className={styles.card}>
            <div className={styles.emptyBox}>Đang tải dữ liệu...</div>
          </section>
        ) : (
          <div className={styles.cardsGrid}>
            {rooms.map((room) => {
              const isBusy = busyRoomIds.has(room.id);
              return (
                <article className={styles.itemCard} key={room.id}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{room.roomName}</h3>
                    <span className={`${styles.badge} ${isBusy ? styles.badgeRed : styles.badgeGreen}`}>
                      {isBusy ? "Đang sử dụng" : "Còn trống"}
                    </span>
                  </div>

                  <p className={styles.itemMeta}>
                    Bác sĩ phụ trách: {room.currentDoctorUsername || "Chưa phân công"}
                  </p>

                  <div className={styles.modalActions}>
                    <button type="button" className={styles.outlineButton} onClick={() => openAssignModal(room)}>
                      Phân công bác sĩ
                    </button>
                    <button type="button" className={styles.iconButton} onClick={() => openEditModal(room)}>
                      <Edit size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className={styles.scheduleSection}>
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.itemTitle}>Lịch phân công tháng</h2>
                <p className={styles.itemMeta}>Theo dõi ngày, giờ và bác sĩ phụ trách theo từng phòng khám.</p>
              </div>
              <div className={styles.scheduleToolbar}>
                <input
                  type="month"
                  className={styles.selectInput}
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
                <button type="button" className={styles.primaryButton} onClick={() => openScheduleModal("create")}>
                  <Plus size={16} /> Thêm lịch
                </button>
              </div>
            </div>

            {scheduleLoading ? (
              <div className={styles.emptyBox}>Đang tải lịch phân công...</div>
            ) : (
              <div className={styles.scheduleGrid}>
                {WEEKDAY_LABELS.map((label) => (
                  <div className={styles.scheduleWeekHeader} key={label}>
                    {label}
                  </div>
                ))}

                {calendarCells.map((dateValue, index) => {
                  if (!dateValue) {
                    return <div className={`${styles.scheduleCell} ${styles.scheduleCellEmpty}`} key={`empty-${index}`} />;
                  }

                  const items = scheduleByDate.get(dateValue) ?? [];
                  const dayNumber = dateValue.split("-")[2];
                  const weekdayIndex = (new Date(dateValue).getDay() + 6) % 7;

                  return (
                    <div className={styles.scheduleCell} key={dateValue}>
                      <div className={styles.scheduleCellHeader}>
                        <span className={styles.scheduleDayNumber}>{dayNumber}</span>
                        <span className={styles.scheduleDayLabel}>{WEEKDAY_LABELS[weekdayIndex]}</span>
                      </div>

                      {items.length === 0 ? (
                        <div className={styles.scheduleEmpty}>Chưa phân công</div>
                      ) : (
                        items.map((item) => (
                          <div className={styles.scheduleItem} key={item.id}>
                            <div>
                              <div className={styles.scheduleItemTime}>{item.timeSlot}</div>
                              <div className={styles.scheduleItemMeta}>
                                {item.doctorUsername} · {item.roomName}
                              </div>
                            </div>
                            <div className={styles.scheduleItemActions}>
                              <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => openScheduleModal("edit", item)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => void handleDeleteSchedule(item)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {isModalOpen && (
        <>
          <div className={styles.modalOverlay} onClick={closeModal} />
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {modalMode === "create" && "Thêm phòng khám"}
              {modalMode === "edit" && "Chỉnh sửa phòng khám"}
              {modalMode === "assign" && `Phân công bác sĩ - ${roomName}`}
            </h2>

            {modalMode === "assign" ? (
              <div>
                <div>
                  <label className={styles.fieldLabel}>Chọn bác sĩ</label>
                  <select
                    className={styles.selectInput}
                    value={doctorId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDoctorId(value === "" ? "" : Number(value));
                    }}
                  >
                    <option value="">-- Không phân công --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className={styles.fieldLabel}>Tên phòng khám</label>
                <input
                  className={styles.textInput}
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                />
              </div>
            )}

            <div className={styles.modalActions}>
              <button type="button" className={styles.primaryButton} onClick={() => void handleSubmit()} disabled={submitting}>
                {modalMode === "create" ? "Thêm mới" : modalMode === "assign" ? "Phân công" : "Lưu thay đổi"}
              </button>
              <button type="button" className={styles.outlineButton} onClick={closeModal} disabled={submitting}>
                Hủy
              </button>
            </div>
          </div>
        </>
      )}

      {isScheduleModalOpen && (
        <>
          <div className={styles.modalOverlay} onClick={closeScheduleModal} />
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {scheduleModalMode === "create" ? "Thêm lịch phân công" : "Cập nhật lịch phân công"}
            </h2>

            <div>
              <label className={styles.fieldLabel}>Ngày</label>
              <input
                type="date"
                className={styles.textInput}
                value={scheduleDate}
                min={monthRange?.start}
                max={monthRange?.end}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </div>

            <div className={styles.fieldGrid}>
              <div>
                <label className={styles.fieldLabel}>Giờ bắt đầu</label>
                <input
                  type="time"
                  className={styles.textInput}
                  value={scheduleStartTime}
                  onChange={(event) => setScheduleStartTime(event.target.value)}
                />
              </div>
              <div>
                <label className={styles.fieldLabel}>Giờ kết thúc</label>
                <input
                  type="time"
                  className={styles.textInput}
                  value={scheduleEndTime}
                  onChange={(event) => setScheduleEndTime(event.target.value)}
                />
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div>
                <label className={styles.fieldLabel}>Phòng khám</label>
                <select
                  className={styles.selectInput}
                  value={scheduleRoomId}
                  onChange={(event) => setScheduleRoomId(event.target.value === "" ? "" : Number(event.target.value))}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.fieldLabel}>Bác sĩ</label>
                <select
                  className={styles.selectInput}
                  value={scheduleDoctorId}
                  onChange={(event) => setScheduleDoctorId(event.target.value === "" ? "" : Number(event.target.value))}
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void handleScheduleSubmit()}
                disabled={scheduleSubmitting}
              >
                {scheduleModalMode === "create" ? "Tạo lịch" : "Lưu thay đổi"}
              </button>
              <button type="button" className={styles.outlineButton} onClick={closeScheduleModal} disabled={scheduleSubmitting}>
                Hủy
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
