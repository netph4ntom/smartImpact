import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Radio,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
  X,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { loadPreferences } from '../../services/settingsService.js'
import './HeaderBar.css'

export default function HeaderBar({
  deviceName = 'ESP32',
  connectionStatus = 'online',
  connectionLabel = 'Online',
  lastUpdated = 'Belum ada data',
  sensors = [],
  hasPartialFailure = false,
  failedSensors = [],
}) {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const prevDangerCountRef = useRef(0)

  // Track user-dismissed alert IDs in current session
  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem('smartimpact_dismissed_alerts')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) return new Set(parsed)
        }
      } catch {
        // Fallback to empty Set
      }
    }
    return new Set()
  })

  // Synchronize dismissed alert IDs to sessionStorage
  const updateDismissedAlerts = (newSet) => {
    setDismissedAlertIds(newSet)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('smartimpact_dismissed_alerts', JSON.stringify([...newSet]))
      } catch {
        // Ignore quota errors
      }
    }
  }

  // 1. Compute Raw Alerts based on Critical Thresholds, Warnings, and Device Health
  const rawAlerts = useMemo(() => {
    const list = []

    // A. Critical & Warning Sensor Threshold Alerts
    if (Array.isArray(sensors)) {
      sensors.forEach((sensor) => {
        if (sensor.status === 'danger') {
          list.push({
            id: `critical-${sensor.id}`,
            type: 'danger',
            sensorName: sensor.name,
            title: `Batas Kritis: ${sensor.name}`,
            message: `${sensor.name} terdeteksi bernilai ${sensor.formattedValue} ${sensor.unit || ''}. Nilai telah melewati ambang batas aman.`,
            reason: sensor.reason,
            time: sensor.updatedAt || 'Terkini',
          })
        } else if (sensor.status === 'warning') {
          list.push({
            id: `warn-${sensor.id}`,
            type: 'warning',
            sensorName: sensor.name,
            title: `Perhatian: ${sensor.name}`,
            message: `${sensor.name} berada dalam rentang waspada (${sensor.formattedValue} ${sensor.unit || ''}).`,
            reason: sensor.reason,
            time: sensor.updatedAt || 'Terkini',
          })
        }
      })
    }

    // B. Partial Hardware / Sensor ADC Failure Alert
    if (hasPartialFailure && Array.isArray(failedSensors) && failedSensors.length > 0) {
      list.push({
        id: 'partial-failure',
        type: 'danger',
        sensorName: 'Sensor Hardware',
        title: 'Sensor Terputus / Gangguan ADC',
        message: `Sensor [${failedSensors.join(', ')}] tidak mengirimkan data yang valid. Periksa sambungan kabel sensor pada ESP32.`,
        time: 'Peringatan Aktif',
      })
    }

    // C. Device Offline or Stale Alert
    if (connectionStatus === 'offline') {
      list.push({
        id: 'device-offline',
        type: 'danger',
        sensorName: deviceName,
        title: `${deviceName} Offline`,
        message: 'Perangkat tidak mengirimkan sinyal telemetri dalam waktu lama. Periksa daya dan koneksi Wi-Fi ESP32.',
        time: 'Peringatan Aktif',
      })
    } else if (connectionStatus === 'stale') {
      list.push({
        id: 'device-stale',
        type: 'warning',
        sensorName: deviceName,
        title: `${deviceName} Terlambat`,
        message: 'Telemetri terakhir diterima lebih dari 5 menit yang lalu.',
        time: 'Peringatan Aktif',
      })
    }

    return list
  }, [sensors, hasPartialFailure, failedSensors, connectionStatus, deviceName])

  // Active alerts excluding those dismissed by the user
  const activeAlerts = useMemo(() => {
    return rawAlerts.filter((alert) => !dismissedAlertIds.has(alert.id))
  }, [rawAlerts, dismissedAlertIds])

  const dismissedCount = rawAlerts.filter((alert) => dismissedAlertIds.has(alert.id)).length
  const dangerAlerts = activeAlerts.filter((a) => a.type === 'danger')
  const warningAlerts = activeAlerts.filter((a) => a.type === 'warning')
  const totalAlertsCount = activeAlerts.length
  const hasDanger = dangerAlerts.length > 0

  // Notification clearance actions
  const handleClearAll = () => {
    const allIds = new Set(rawAlerts.map((a) => a.id))
    updateDismissedAlerts(allIds)
  }

  const handleDismissAlert = (id, e) => {
    e?.stopPropagation?.()
    const next = new Set(dismissedAlertIds)
    next.add(id)
    updateDismissedAlerts(next)
  }

  const handleRestoreAlerts = () => {
    updateDismissedAlerts(new Set())
  }

  // 2. Play subtle Web Audio API chime when critical alert emerges (if soundAlerts enabled)
  useEffect(() => {
    if (dangerAlerts.length > prevDangerCountRef.current) {
      try {
        const prefs = loadPreferences()
        if (prefs?.soundAlerts) {
          const AudioContext = window.AudioContext || window.webkitAudioContext
          if (AudioContext) {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(880, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25)
            gain.gain.setValueAtTime(0.12, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            osc.stop(ctx.currentTime + 0.25)
          }
        }
      } catch {
        // Ignore autoplay block
      }
    }
    prevDangerCountRef.current = dangerAlerts.length
  }, [dangerAlerts.length])

  // 3. Close popover on outside click and Escape key
  useEffect(() => {
    if (!isDropdownOpen) return

    const handlePointerDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

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

        {/* Interactive Notification Bell Container */}
        <div className="header-bar__bell-wrap" ref={dropdownRef}>
          <button
            type="button"
            className={`header-bar__action-btn touch-target ${
              hasDanger
                ? 'header-bar__action-btn--danger'
                : totalAlertsCount > 0
                  ? 'header-bar__action-btn--warning'
                  : ''
            }`}
            aria-label={`Notifikasi peringatan ambang batas: ${totalAlertsCount} peringatan aktif`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="dialog"
            title={
              hasDanger
                ? `${dangerAlerts.length} parameter melewati batas kritis!`
                : totalAlertsCount > 0
                  ? `${warningAlerts.length} parameter dalam status waspada`
                  : 'Semua kondisi kualitas air normal'
            }
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <Bell
              className={`header-bar__action-icon ${
                hasDanger ? 'header-bar__action-icon--ringing' : ''
              }`}
              aria-hidden="true"
            />
            {totalAlertsCount > 0 && (
              <span
                className={`header-bar__bell-badge ${
                  hasDanger
                    ? 'header-bar__bell-badge--danger'
                    : 'header-bar__bell-badge--warning'
                }`}
                aria-hidden="true"
              >
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Accessible Notification Popover Panel */}
          {isDropdownOpen && (
            <div
              className="header-bar__notif-dropdown"
              role="dialog"
              aria-modal="false"
              aria-label="Pusat Notifikasi Ambang Batas Kualitas Air"
            >
              {/* Dropdown Header */}
              <div className="notif-dropdown__header">
                <div className="notif-dropdown__header-title-wrap">
                  <h3 className="notif-dropdown__title">Notifikasi</h3>
                  <span
                    className={`notif-dropdown__badge ${
                      hasDanger
                        ? 'notif-dropdown__badge--danger'
                        : totalAlertsCount > 0
                          ? 'notif-dropdown__badge--warning'
                          : 'notif-dropdown__badge--normal'
                    }`}
                  >
                    {hasDanger
                      ? `${dangerAlerts.length} Kritis`
                      : totalAlertsCount > 0
                        ? `${warningAlerts.length} Perhatian`
                        : 'Normal'}
                  </span>
                </div>
                <div className="notif-dropdown__header-actions">
                  {totalAlertsCount > 0 && (
                    <button
                      type="button"
                      className="notif-clear-all-btn"
                      onClick={handleClearAll}
                      title="Bersihkan semua notifikasi"
                      aria-label="Bersihkan semua notifikasi"
                    >
                      <Trash2 className="notif-clear-all-icon" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="notif-dropdown__close-btn"
                    onClick={() => setIsDropdownOpen(false)}
                    aria-label="Tutup panel notifikasi"
                  >
                    <X className="notif-close-icon" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Dropdown Body: Empty State or Alerts List */}
              <div className="notif-dropdown__body">
                {totalAlertsCount === 0 ? (
                  dismissedCount > 0 && rawAlerts.length > 0 ? (
                    <div className="notif-empty-state">
                      <div className="notif-empty-icon-wrap notif-empty-icon-wrap--cleared">
                        <CheckCheck className="notif-empty-icon" aria-hidden="true" />
                      </div>
                      <h4 className="notif-empty-title">Semua Notifikasi Telah Dibersihkan</h4>
                      <p className="notif-empty-desc">
                        {dismissedCount} notifikasi telah Anda bersihkan untuk sesi ini.
                      </p>
                      <button
                        type="button"
                        className="notif-restore-btn touch-target"
                        onClick={handleRestoreAlerts}
                        title="Tampilkan kembali notifikasi aktif"
                      >
                        <RotateCcw className="notif-restore-icon" aria-hidden="true" />
                        <span>Tampilkan Kembali ({rawAlerts.length})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="notif-empty-state">
                      <div className="notif-empty-icon-wrap">
                        <CheckCircle2 className="notif-empty-icon" aria-hidden="true" />
                      </div>
                      <h4 className="notif-empty-title">Semua Parameter Normal</h4>
                      <p className="notif-empty-desc">
                        Suhu air, pH, Turbidity, dan Salinitas berada dalam batas baku mutu aman perairan/tambak.
                      </p>
                    </div>
                  )
                ) : (
                  <ul className="notif-alert-list" role="list">
                    {activeAlerts.map((alert) => (
                      <li
                        key={alert.id}
                        className={`notif-alert-card notif-alert-card--${alert.type}`}
                      >
                        <div className="notif-alert-card__icon-col">
                          {alert.type === 'danger' ? (
                            <AlertOctagon
                              className="notif-alert-icon notif-alert-icon--danger"
                              aria-hidden="true"
                            />
                          ) : (
                            <AlertTriangle
                              className="notif-alert-icon notif-alert-icon--warning"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="notif-alert-card__content">
                          <div className="notif-alert-card__top">
                            <strong className="notif-alert-card__title">
                              {alert.title}
                            </strong>
                            <div className="notif-alert-card__meta-actions">
                              <span className="notif-alert-card__time">
                                {alert.time}
                              </span>
                              <button
                                type="button"
                                className="notif-card-dismiss-btn"
                                onClick={(e) => handleDismissAlert(alert.id, e)}
                                title="Hapus notifikasi ini"
                                aria-label={`Hapus notifikasi ${alert.title}`}
                              >
                                <X className="notif-card-dismiss-icon" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <p className="notif-alert-card__msg">
                            {alert.message}
                          </p>
                          {alert.reason && (
                            <span className="notif-alert-card__reason">
                              {alert.reason}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Dropdown Footer: Shortcut to Threshold Settings & Restore Action */}
              <div className="notif-dropdown__footer">
                <div className="notif-footer-row">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate('/pengaturan')
                    }}
                    className="notif-footer-link"
                  >
                    <SlidersHorizontal className="notif-footer-icon" aria-hidden="true" />
                    <span>Konfigurasi Ambang Batas</span>
                  </button>
                  {dismissedCount > 0 && totalAlertsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleRestoreAlerts}
                      className="notif-footer-restore-btn"
                      title="Pulihkan notifikasi yang sebelumnya dibersihkan"
                    >
                      <RotateCcw className="notif-footer-restore-icon" aria-hidden="true" />
                      <span>Pulihkan ({dismissedCount})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

