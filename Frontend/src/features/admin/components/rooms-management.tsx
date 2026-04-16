"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus } from "lucide-react";
import { toast } from "sonner";

import { ForbiddenSectionNotice } from "@/components/ui/forbidden-section-notice";
import { getApiErrorMessage, isForbiddenError } from "@/services/api";
import { adminService, type AdminRoom, type AdminUser } from "@/services/adminService";
import { getForbiddenSectionMessage } from "@/utils/forbidden-message";
import styles from "../admin.module.css";

type RoomModalMode = "create" | "edit" | "assign";

export function RoomsManagement() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roomsForbidden, setRoomsForbidden] = useState(false);
  const [doctorsForbidden, setDoctorsForbidden] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<RoomModalMode>("create");
  const [selectedRoom, setSelectedRoom] = useState<AdminRoom | null>(null);
  const [roomName, setRoomName] = useState("");
  const [doctorId, setDoctorId] = useState<number | "">("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsResult, usersResult] = await Promise.allSettled([adminService.getRooms(), adminService.getUsers()]);
      const nonForbiddenErrors: unknown[] = [];

      if (roomsResult.status === "fulfilled") {
        setRooms(roomsResult.value);
        setRoomsForbidden(false);
      } else if (isForbiddenError(roomsResult.reason)) {
        setRooms([]);
        setRoomsForbidden(true);
      } else {
        nonForbiddenErrors.push(roomsResult.reason);
      }

      if (usersResult.status === "fulfilled") {
        setDoctors(usersResult.value.filter((user) => user.role === "DOCTOR" && user.isActive));
        setDoctorsForbidden(false);
      } else if (isForbiddenError(usersResult.reason)) {
        setDoctors([]);
        setDoctorsForbidden(true);
      } else {
        nonForbiddenErrors.push(usersResult.reason);
      }

      if (nonForbiddenErrors.length > 0) {
        toast.error(getApiErrorMessage(nonForbiddenErrors[0], "Không thể tải dữ liệu phòng khám"));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải dữ liệu phòng khám"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const busyRoomIds = useMemo(() => {
    return new Set<number>(rooms.filter((room) => room.currentDoctorId != null).map((room) => room.id));
  }, [rooms]);
    //Hàm mở popup với từng chế độ
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
    if (doctorsForbidden) {
      toast.error(getForbiddenSectionMessage("danh sách bác sĩ"));
      return;
    }

    setModalMode("assign");
    setSelectedRoom(room);
    setRoomName(room.roomName);
    setDoctorId(room.currentDoctorId ?? "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
    }
  };
  //Lưu dữ liệu khi bấm submit form với từng chế độ khác nhau
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

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Quản lý phòng khám</h1>
          <p>Quản lý phòng khám và phân công bác sĩ trực phòng.</p>
        </div>

        <div className={styles.toolbar}>
          <button type="button" className={styles.primaryButton} onClick={openCreateModal} disabled={roomsForbidden}>
            <Plus size={16} /> Thêm phòng khám
          </button>
        </div>

        {(roomsForbidden || doctorsForbidden) && (
          <section className={styles.card}>
            {roomsForbidden && <p style={{ color: "#b91c1c" }}><ForbiddenSectionNotice area="danh sách phòng khám" /></p>}
            {doctorsForbidden && <p style={{ color: "#b45309" }}><ForbiddenSectionNotice area="danh sách bác sĩ phân công" /></p>}
          </section>
        )}

        {loading ? (
          <section className={styles.card}>
            <div className={styles.emptyBox}>Đang tải dữ liệu...</div>
          </section>
        ) : (
          <div className={styles.cardsGrid}>
            {!roomsForbidden && rooms.map((room) => {
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
                    <button type="button" className={styles.outlineButton} onClick={() => openAssignModal(room)} disabled={doctorsForbidden}>
                      Phân công bác sĩ
                    </button>
                    <button type="button" className={styles.iconButton} onClick={() => openEditModal(room)}>
                      <Edit size={16} />
                    </button>
                  </div>
                </article>
              );
            })}

            {roomsForbidden && (
              <section className={styles.card}>
                <div className={styles.emptyBox} style={{ color: "#b91c1c" }}>
                  <ForbiddenSectionNotice area="dữ liệu phòng khám" />
                </div>
              </section>
            )}

            {!roomsForbidden && rooms.length === 0 && (
              <section className={styles.card}>
                <div className={styles.emptyBox}>Chưa có phòng khám nào.</div>
              </section>
            )}
          </div>
        )}
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
    </main>
  );
}
