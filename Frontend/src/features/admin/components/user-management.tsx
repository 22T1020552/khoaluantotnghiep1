'use client';

import { useMemo, useState } from "react";
import { Edit, Lock, Plus, Search, Trash2, Unlock } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/user.type";
import styles from "../admin.module.css";

const initialUsers: User[] = [
  { id: 1, username: "admin", password: "********", role: "admin", is_active: true },
  { id: 2, username: "doctor.hung", password: "********", role: "doctor", is_active: true },
  { id: 3, username: "le.tan.mai", password: "********", role: "receptionist", is_active: true },
  { id: 4, username: "thu.ngan.tuan", password: "********", role: "cashier", is_active: false },
];

const roleLabels: Record<User["role"], string> = {
  admin: "Quan tri vien",
  doctor: "Bac si",
  receptionist: "Le tan",
  cashier: "Thu ngan",
};

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | User["role"]>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    role: "doctor" as User["role"],
    password: "",
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || filterRole === user.role;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, role: user.role, password: user.password });
    } else {
      setEditingUser(null);
      setFormData({ username: "", role: "doctor", password: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.username.trim()) {
      toast.error("Vui long nhap ten dang nhap");
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? { ...user, username: formData.username.trim(), role: formData.role }
            : user,
        ),
      );
      toast.success("Da cap nhat tai khoan");
    } else {
      const newUser: User = {
        id: Date.now(),
        username: formData.username.trim(),
        role: formData.role,
        is_active: true,
        password: formData.password || "********",
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success("Da them tai khoan");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Ban co chac muon xoa tai khoan nay?")) {
      return;
    }
    setUsers((prev) => prev.filter((user) => user.id !== id));
    toast.success("Da xoa tai khoan");
  };

  const handleToggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, is_active: !user.is_active } : user)),
    );
    toast.success("Da cap nhat trang thai");
  };

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Quan ly nguoi dung</h1>
          <p>Them, sua, khoa va xoa tai khoan he thong.</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={18} />
            <input
              className={styles.searchInput}
              placeholder="Tim theo ten dang nhap..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.selectInput}
              value={filterRole}
              onChange={(event) => setFilterRole(event.target.value as "all" | User["role"])}
            >
              <option value="all">Tat ca vai tro</option>
              <option value="admin">Quan tri vien</option>
              <option value="doctor">Bac si</option>
              <option value="receptionist">Le tan</option>
              <option value="cashier">Thu ngan</option>
            </select>
          </div>

          <button type="button" className={styles.primaryButton} onClick={() => openModal()}>
            <Plus size={16} /> Them nguoi dung
          </button>
        </div>

        <section className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ten dang nhap</th>
                  <th>Vai tro</th>
                  <th>Trang thai</th>
                  <th style={{ textAlign: "right" }}>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeBlue}`}>{roleLabels[user.role]}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${user.is_active ? styles.badgeGreen : styles.badgeGray}`}>
                        {user.is_active ? "Hoat dong" : "Tam khoa"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button type="button" className={styles.iconButton} onClick={() => openModal(user)}>
                          <Edit size={16} />
                        </button>
                        <button type="button" className={styles.iconButton} onClick={() => handleToggleStatus(user.id)}>
                          {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button type="button" className={styles.iconButton} onClick={() => handleDelete(user.id)}>
                          <Trash2 size={16} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && <div className={styles.emptyBox}>Khong tim thay nguoi dung.</div>}
          </div>
        </section>
      </div>

      {isModalOpen && (
        <>
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)} />
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingUser ? "Chinh sua tai khoan" : "Them tai khoan"}</h2>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.fieldLabel} htmlFor="username">Ten dang nhap</label>
                <input
                  id="username"
                  className={styles.textInput}
                  value={formData.username}
                  onChange={(event) => setFormData((prev) => ({ ...prev, username: event.target.value }))}
                />
              </div>
              <div>
                <label className={styles.fieldLabel} htmlFor="role">Vai tro</label>
                <select
                  id="role"
                  className={styles.selectInput}
                  value={formData.role}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, role: event.target.value as User["role"] }))
                  }
                >
                  <option value="admin">Quan tri vien</option>
                  <option value="doctor">Bac si</option>
                  <option value="receptionist">Le tan</option>
                  <option value="cashier">Thu ngan</option>
                </select>
              </div>
              <div>
                <label className={styles.fieldLabel} htmlFor="password">Mat khau</label>
                <input
                  id="password"
                  type="password"
                  className={styles.textInput}
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.primaryButton} onClick={handleSave}>
                {editingUser ? "Cap nhat" : "Them moi"}
              </button>
              <button type="button" className={styles.outlineButton} onClick={() => setIsModalOpen(false)}>
                Huy
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}