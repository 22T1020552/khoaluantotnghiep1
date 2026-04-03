"use client";

import type { Room } from "@/types/user.type";
import styles from "../admin.module.css";

export function RoomsManagement() {
  const rooms: Array<Room & { doctor_name: string; is_busy: boolean }> = [
    { id: 1, room_name: "Phong kham 1", current_doctor_id: 11, doctor_name: "BS. Nguyen Van Hung", is_busy: true },
    { id: 2, room_name: "Phong kham 2", current_doctor_id: 12, doctor_name: "BS. Tran Thi Mai", is_busy: false },
    { id: 3, room_name: "Phong kham 3", current_doctor_id: 13, doctor_name: "BS. Le Quoc Tuan", is_busy: true },
    { id: 4, room_name: "Phong kham 4", current_doctor_id: null, doctor_name: "Chua phan cong", is_busy: false },
    { id: 5, room_name: "Phong xet nghiem", current_doctor_id: null, doctor_name: "Ky thuat vien", is_busy: false },
    { id: 6, room_name: "Phong sieu am", current_doctor_id: 14, doctor_name: "BS. Nguyen Thi Lan", is_busy: true },
  ];

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Quan ly phong kham</h1>
          <p>Quan ly phong kham va phan cong bac si truc.</p>
        </div>

        <div className={styles.cardsGrid}>
          {rooms.map((room) => (
            <article className={styles.itemCard} key={room.id}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{room.room_name}</h3>
                <span className={`${styles.badge} ${room.is_busy ? styles.badgeRed : styles.badgeGreen}`}>
                  {room.is_busy ? "Dang su dung" : "Con trong"}
                </span>
              </div>

              <p className={styles.itemMeta}>Bac si phu trach: {room.doctor_name}</p>

              <div className={styles.modalActions}>
                <button type="button" className={styles.outlineButton}>Phan cong bac si</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}