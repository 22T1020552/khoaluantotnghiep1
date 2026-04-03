import { Activity, Calendar, DollarSign, Package, ShoppingBag, Stethoscope, TrendingUp, Users } from "lucide-react";
import styles from "../admin.module.css";

export function AdminDashboard() {
  const monthlyVisits = [
    { month: "Thang 1", value: 280, percent: 70 },
    { month: "Thang 2", value: 310, percent: 78 },
    { month: "Thang 3", value: 342, percent: 86 },
    { month: "Thang 4", value: 290, percent: 73 },
    { month: "Thang 5", value: 350, percent: 88 },
    { month: "Thang 6", value: 380, percent: 95 },
  ];

  const revenues = [
    { service: "Kham tong quat", amount: 180000000 },
    { service: "Xet nghiem", amount: 120000000 },
    { service: "Sieu am", amount: 85000000 },
    { service: "Thuoc", amount: 73000000 },
  ];

  return (
    <main className={styles.mainArea}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Bang dieu khien quan tri</h1>
          <p>Tong quan he thong phong kham va cac chi so van hanh.</p>
        </div>

        <div className={styles.statsGrid}>
          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statBlue}`}>
              <Users size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Tong benh nhan</p>
              <p className={styles.statValue}>5,420</p>
            </div>
          </section>

          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statGreen}`}>
              <Calendar size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Luot kham thang nay</p>
              <p className={styles.statValue}>342</p>
            </div>
          </section>

          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statOrange}`}>
              <Stethoscope size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Bac si</p>
              <p className={styles.statValue}>15</p>
            </div>
          </section>

          <section className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statRed}`}>
              <DollarSign size={20} />
            </div>
            <div>
              <p className={styles.statLabel}>Doanh thu thang</p>
              <p className={styles.statValue}>458M</p>
            </div>
          </section>
        </div>

        <div className={styles.cardsGrid}>
          <section className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <h3 className={styles.itemTitle}>Luot kham theo thang</h3>
              <TrendingUp size={20} color="#16a34a" />
            </div>
            <div className={styles.barGroup}>
              {monthlyVisits.map((item) => (
                <div className={styles.barRow} key={item.month}>
                  <span className={styles.itemMeta}>{item.month}</span>
                  <div className={styles.progress}>
                    <div className={styles.progressFill} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className={styles.itemMeta}>{item.value} luot</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.itemCard}>
            <h3 className={styles.itemTitle}>Doanh thu theo dich vu</h3>
            <div className={styles.barGroup}>
              {revenues.map((item) => (
                <div className={styles.barRow} key={item.service}>
                  <span className={styles.itemMeta}>{item.service}</span>
                  <div className={styles.progress}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${((item.amount / 458000000) * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <span className={styles.itemMeta}>{(item.amount / 1000000).toFixed(0)}M</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.cardsGrid}>
          <section className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <div className={`${styles.statIcon} ${styles.statBlue}`}>
                <Activity size={20} />
              </div>
            </div>
            <p className={styles.itemMeta}>Phong kham</p>
            <p className={styles.statValue}>8 phong</p>
          </section>

          <section className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <div className={`${styles.statIcon} ${styles.statGreen}`}>
                <Package size={20} />
              </div>
            </div>
            <p className={styles.itemMeta}>Loai thuoc</p>
            <p className={styles.statValue}>245 loai</p>
          </section>

          <section className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <div className={`${styles.statIcon} ${styles.statOrange}`}>
                <ShoppingBag size={20} />
              </div>
            </div>
            <p className={styles.itemMeta}>Dich vu</p>
            <p className={styles.statValue}>32 dich vu</p>
          </section>
        </div>
      </div>
    </main>
  );
}