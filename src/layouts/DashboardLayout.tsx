import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar/Navbar'
import Sidebar from '../components/dashboard/Sidebar/Sidebar'
import styles from './DashboardLayout.module.css'

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* ── Desktop sidebar ─────────────────── */}
        <aside className={styles.desktopSidebar}>
          <Sidebar />
        </aside>

        {/* ── Mobile sidebar overlay ───────────── */}
        {sidebarOpen && (
          <div className={`${styles.mobileOverlay} overlay-bg`} aria-modal="true" role="dialog" aria-label="Navigation">
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close navigation"
              className={styles.backdrop}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Panel */}
            <aside className={`${styles.mobilePanel} sidebar-panel`}>
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* ── Main content ─────────────────────── */}
        <section className={styles.main}>
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <div className={styles.content}>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardLayout
