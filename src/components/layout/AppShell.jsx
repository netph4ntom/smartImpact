import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import HeaderBar from './HeaderBar'
import BottomNav from './BottomNav'
import { useTelemetry } from '../../hooks/useTelemetry'
import './AppShell.css'

export default function AppShell() {
  const { telemetry } = useTelemetry()

  // Desktop sidebar minimized/collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParam = new URLSearchParams(window.location.search).get('sidebar')
        if (urlParam === 'minimized' || urlParam === 'collapsed') return true
        if (urlParam === 'expanded') return false
        const saved = localStorage.getItem('smartimpact_sidebar_collapsed')
        if (saved !== null) {
          return saved === 'true'
        }
      }
    } catch {
      // Ignore read errors
    }
    return false // Default expanded on desktop
  })

  // Mobile drawer open state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileDrawerOpen((prev) => !prev)
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev
        try {
          localStorage.setItem('smartimpact_sidebar_collapsed', String(next))
        } catch {
          // Ignore write errors
        }
        return next
      })
    }
  }

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false)
  }

  return (
    <div
      className={`app-shell ${isSidebarCollapsed ? 'app-shell--sidebar-collapsed' : ''} ${
        isMobileDrawerOpen ? 'app-shell--mobile-drawer-open' : ''
      }`}
    >
      {/* Mobile Backdrop Overlay when mobile drawer is open */}
      {isMobileDrawerOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileDrawer}
          aria-hidden="true"
        />
      )}

      {/* Fixed Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={closeMobileDrawer}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main App Body */}
      <div className="app-shell__body">
        {/* Fixed Header with real telemetry connection status */}
        <HeaderBar
          deviceName={telemetry?.deviceName || 'ESP32'}
          connectionStatus={telemetry?.connectionStatus || 'unknown'}
          connectionLabel={telemetry?.connectionLabel || 'Tidak Diketahui'}
          lastUpdated={telemetry?.formattedReceivedAt || 'Belum ada data'}
        />

        {/* Content Area */}
        <main id="main-content" className="app-shell__content">
          <div className="app-shell__container">
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav for Mobile */}
        <BottomNav />
      </div>
    </div>
  )
}
