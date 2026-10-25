import { Bell, Radio } from 'lucide-react'
import './HeaderBar.css'

export default function HeaderBar({
  deviceName = 'ESP32',
  connectionStatus = 'online',
  connectionLabel = 'Online',
  lastUpdated = '12 Jun 2025, 14:32',
}) {
  const getStatusClass = () => {
    switch (connectionStatus) {
      case 'online':
        return 'header-bar__status-pill--online'
      case 'stale':
        return 'header-bar__status-pill--stale'
      case 'offline':
        return 'header-bar__status-pill--offline'
      case 'unknown':
      default:
        return 'header-bar__status-pill--unknown'
    }
  }

  return (
    <header className="header-bar" role="banner">
      {/* Left Section: Mobile Brand / Desktop Context */}
      <div className="header-bar__left">
        {/* Mobile Brand View (only shown on mobile) */}
        <div className="header-bar__mobile-brand">
          <div className="header-bar__logo-icon">
            <img src="/pwa-192x192.png" alt="smartimpact logo" className="header-bar__logo-img" />
          </div>
          <span className="header-bar__brand-title">smartimpact</span>
        </div>

        {/* Desktop Context / Spacer */}
        <div className="header-bar__context">
          <span className="header-bar__desktop-badge">
            <Radio className="header-bar__context-icon" aria-hidden="true" />
            Politeknik Negeri Banyuwangi
          </span>
        </div>
      </div>

      {/* Right-side Status & Tools */}
      <div className="header-bar__right">
        {/* Device Status Pill */}
        <div
          className={`header-bar__status-pill ${getStatusClass()}`}
          title={`Perangkat: ${deviceName} (Status: ${connectionLabel})`}
        >
          <span className="header-bar__status-dot" aria-hidden="true" />
          <span className="header-bar__status-text">
            {deviceName} {connectionLabel}
          </span>
        </div>

        {/* Timestamp (Desktop only) */}
        <span className="header-bar__timestamp" title="Waktu pembaruan terakhir">
          {lastUpdated}
        </span>

        {/* Accessible Notification Button */}
        <button
          type="button"
          className="header-bar__action-btn touch-target"
          aria-label="Lihat notifikasi dan peringatan sistem"
          title="Notifikasi"
        >
          <Bell className="header-bar__action-icon" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
