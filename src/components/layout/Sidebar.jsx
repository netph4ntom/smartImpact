import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  History,
  Settings,
  Leaf,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import './Sidebar.css'

export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}) {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/riwayat',
      label: 'Riwayat',
      icon: History,
    },
    {
      to: '/pengaturan',
      label: 'Pengaturan',
      icon: Settings,
    },
  ]

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && onCloseMobile) {
      onCloseMobile()
    }
  }

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'} ${
        isMobileOpen ? 'sidebar--mobile-open' : ''
      }`}
      aria-label="Navigasi Utama"
    >
      {/* Brand Header */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-main" title={isCollapsed ? 'smartimpact — IoT Water Monitoring' : undefined}>
          <div className="sidebar__logo-icon">
            <img src="/pwa-192x192.png" alt="smartimpact logo" className="sidebar__brand-img" />
          </div>
          {!isCollapsed && (
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">smartimpact</span>
              <span className="sidebar__brand-tag">IOT Water Monitoring</span>
            </div>
          )}
        </div>

        {/* Mobile-only Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            className="sidebar__mobile-close-btn touch-target"
            onClick={onCloseMobile}
            aria-label="Tutup menu sidebar"
            title="Tutup menu"
          >
            <X className="sidebar__close-icon" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <li key={item.to} className="sidebar__menu-item">
                <NavLink
                  to={item.to}
                  onClick={handleNavClick}
                  title={item.label}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <IconComponent className="sidebar__link-icon" aria-hidden="true" />
                  {!isCollapsed && <span className="sidebar__link-text">{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sidebar Footer Card & Bottom Action */}
      <div className="sidebar__footer">
        {isCollapsed ? (
          <div
            className="sidebar__footer-icon-only"
            title="smartimpact — Air Bersih, Masa Depan Lebih Baik"
          >
            <div className="sidebar__quote-icon-wrap">
              <Leaf className="sidebar__quote-icon" aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="sidebar__quote-card">
            <div className="sidebar__quote-icon-wrap">
              <Leaf className="sidebar__quote-icon" aria-hidden="true" />
            </div>
            <p className="sidebar__quote-text">Tambak Cerdas, Air Terpantau</p>
            <span className="sidebar__quote-brand">smartimpact</span>
          </div>
        )}

        {/* Desktop Bottom Collapse / Expand Toggle Button */}
        <div className="sidebar__bottom-action">
          <button
            type="button"
            className="sidebar__bottom-toggle"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Perluas sidebar (Expand)' : 'Kecilkan sidebar (Minimize)'}
            title={isCollapsed ? 'Perluas sidebar (Expand)' : 'Kecilkan sidebar (Minimize)'}
          >
            {isCollapsed ? (
              <ChevronRight className="sidebar__bottom-toggle-icon" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="sidebar__bottom-toggle-icon" aria-hidden="true" />
                <span className="sidebar__bottom-toggle-text">Kecilkan Menu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
