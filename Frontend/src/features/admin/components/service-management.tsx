"use client";

import { useMemo, useState } from "react";
import { Activity, Plus, Search } from "lucide-react";
import type { Service } from "@/types/medicine.type";
import styles from "../admin.module.css";

export function ServicesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const services: Service[] = [
    { id: 1, service_name: "Kham tong quat", current_price: 150000, is_active: true },
    { id: 2, service_name: "Xet nghiem mau", current_price: 200000, is_active: true },
    { id: 3, service_name: "Sieu am thai", current_price: 300000, is_active: true },
    { id: 4, service_name: "Dien tim", current_price: 100000, is_active: true },
    { id: 5, service_name: "X-quang phoi", current_price: 250000, is_active: false },
    { id: 6, service_name: "Xet nghiem nuoc tieu", current_price: 80000, is_active: true },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      service.service_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [services, searchQuery]);

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
        <div>
            <h1>Quan ly dich vu</h1>
            <p>Danh muc dich vu can lam sang va gia hien hanh.</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={18} />
            <input
              className={styles.searchInput}
              value={searchQuery}
              placeholder="Tim theo ten dich vu..."
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <button type="button" className={styles.primaryButton}>
            <Plus size={16} /> Them dich vu
          </button>
        </div>

        <div className={styles.cardsGrid}>
          {filteredServices.map((service) => (
            <article className={styles.itemCard} key={service.id}>
              <div className={styles.itemHeader}>
                <div className={`${styles.statIcon} ${styles.statBlue}`}>
                  <Activity size={20} />
                </div>
                <span className={`${styles.badge} ${service.is_active ? styles.badgeGreen : styles.badgeGray}`}>
                  {service.is_active ? "Dang su dung" : "Tam dung"}
                </span>
              </div>
              <h3 className={styles.itemTitle}>{service.service_name}</h3>
              <p className={styles.valueText}>{service.current_price.toLocaleString("vi-VN")}đ</p>
              <div className={styles.modalActions}>
                <button type="button" className={styles.outlineButton}>Chinh sua</button>
                <button type="button" className={styles.outlineButton}>Xoa</button>
              </div>
            </article>
          ))}
          {filteredServices.length === 0 && (
            <section className={styles.card}>
              <div className={styles.emptyBox}>Khong tim thay dich vu phu hop.</div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
