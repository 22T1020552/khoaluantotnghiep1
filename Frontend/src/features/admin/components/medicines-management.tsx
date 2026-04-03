"use client";

import { useMemo, useState } from "react";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Medicine } from "@/types/medicine.type";
import { medications } from "../medication";
import styles from "../admin.module.css";

export function MedicinesManagement() {
  const [meds, setMeds] = useState<Medicine[]>(medications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredMeds = useMemo(() => {
    return meds.filter((med) => {
      const matchesSearch = med.medicine_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? med.is_active : !med.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [meds, searchQuery, statusFilter]);

  const handleDelete = (id: number) => {
    if (!confirm("Ban co chac muon xoa thuoc nay?")) {
      return;
    }
    setMeds((prev) => prev.filter((med) => med.id !== id));
    toast.success("Da xoa thuoc");
  };

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Quan ly danh muc thuoc</h1>
          <p>Quan ly kho thuoc va cap nhat gia ban hien tai.</p>
        </div>

        <div className={styles.statsGrid}>
          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statBlue}`}>
              <Package size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Tong loai thuoc</p>
              <p className={styles.statValue}>{meds.length}</p>
            </div>
          </section>

          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statGreen}`}>
              <Package size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Dang kinh doanh</p>
              <p className={styles.statValue}>{meds.filter((med) => med.is_active).length}</p>
            </div>
          </section>

          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statOrange}`}>
              <Package size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Sap het hang</p>
              <p className={styles.statValue}>{meds.filter((med) => med.stock_quantity < 200).length}</p>
            </div>
          </section>

          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statRed}`}>
              <Package size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Tam ngung</p>
              <p className={styles.statValue}>{meds.filter((med) => !med.is_active).length}</p>
            </div>
          </section>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={18} />
            <input
              className={styles.searchInput}
              placeholder="Tim theo ten thuoc..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.selectInput}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
            >
              <option value="all">Tat ca</option>
              <option value="active">Dang kinh doanh</option>
              <option value="inactive">Tam ngung</option>
            </select>
          </div>

          <button type="button" className={styles.primaryButton}>
            <Plus size={16} /> Them thuoc
          </button>
        </div>

        <section className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ten thuoc</th>
                  <th>Don vi</th>
                  <th>Gia ban</th>
                  <th>Ton kho</th>
                  <th>Trang thai</th>
                  <th style={{ textAlign: "right" }}>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((med) => (
                  <tr key={med.id}>
                    <td>{med.medicine_name}</td>
                    <td>{med.unit}</td>
                    <td>{med.selling_price.toLocaleString("vi-VN")}đ</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          med.stock_quantity < 200 ? styles.badgeOrange : styles.badgeGreen
                        }`}
                      >
                        {med.stock_quantity} {med.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${med.is_active ? styles.badgeBlue : styles.badgeGray}`}>
                        {med.is_active ? "Dang kinh doanh" : "Tam ngung"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button type="button" className={styles.iconButton}>
                          <Edit size={16} />
                        </button>
                        <button type="button" className={styles.iconButton} onClick={() => handleDelete(med.id)}>
                          <Trash2 size={16} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMeds.length === 0 && <div className={styles.emptyBox}>Khong tim thay thuoc nao.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
