import { AlertTriangle, Clock, WifiOff, Globe } from 'lucide-react'
import './StaleBanner.css'

/**
 * StaleBanner Component
 * Renders prominent alerts for stale data, browser offline, ESP32 device offline,
 * partial sensor failure, or background refresh failure.
 */
export default function StaleBanner({
  connectionStatus = 'online',
  ageMinutes = null,
  hasPartialFailure = false,
  failedSensors = [],
  formattedReceivedAt = '',
  isBrowserOnline = true,
  refreshWarning = null,
}) {
  const isBrowserOffline = !isBrowserOnline

  // If online, browser active, no sensor failure, and no refresh warning, render nothing
  if (
    !isBrowserOffline &&
    connectionStatus === 'online' &&
    !hasPartialFailure &&
    !refreshWarning
  ) {
    return null
  }

  return (
    <div className="stale-banner-stack" role="region" aria-label="Status Peringatan Sistem">
      {/* 1. Browser Offline (Distinct from ESP32 offline - AGENT.md rule) */}
      {isBrowserOffline && (
        <div className="stale-banner stale-banner--browser-offline" role="alert">
          <Globe className="stale-banner__icon" aria-hidden="true" />
          <div className="stale-banner__content">
            <p className="stale-banner__title">Koneksi Internet Browser Terputus (Browser Offline)</p>
            <p className="stale-banner__desc">
              Perangkat/browser Anda sedang tidak terhubung ke internet. Aplikasi tetap dapat digunakan dalam mode offline dengan menampilkan data telemetri cache terakhir.
            </p>
          </div>
        </div>
      )}

      {/* 2. Refresh Warning (Data tetap dipertahankan meski fetch gagal) */}
      {refreshWarning && (
        <div className="stale-banner stale-banner--warning" role="status">
          <Clock className="stale-banner__icon" aria-hidden="true" />
          <div className="stale-banner__content">
            <p className="stale-banner__title">Peringatan Penyegaran Telemetri</p>
            <p className="stale-banner__desc">{refreshWarning}</p>
          </div>
        </div>
      )}

      {/* 3. ESP32 Hardware Offline (Only when browser is online to avoid confusion) */}
      {!isBrowserOffline && connectionStatus === 'offline' && (
        <div className="stale-banner stale-banner--offline" role="status">
          <WifiOff className="stale-banner__icon" aria-hidden="true" />
          <div className="stale-banner__content">
            <p className="stale-banner__title">Perangkat ESP32 Sedang Offline</p>
            <p className="stale-banner__desc">
              Modul sensor di lokasi tidak mengirimkan telemetri lebih dari 15 menit. Menampilkan rekaman data terakhir ({formattedReceivedAt}).
            </p>
          </div>
        </div>
      )}

      {/* 4. Stale Data Notice */}
      {!isBrowserOffline && connectionStatus === 'stale' && (
        <div className="stale-banner stale-banner--warning" role="status">
          <Clock className="stale-banner__icon" aria-hidden="true" />
          <div className="stale-banner__content">
            <p className="stale-banner__title">Data Terlambat Diterima (Stale)</p>
            <p className="stale-banner__desc">
              Telemetri terakhir diterima sekitar {ageMinutes || 'beberapa'} menit yang lalu ({formattedReceivedAt}).
            </p>
          </div>
        </div>
      )}

      {/* 5. Partial Sensor Failure */}
      {hasPartialFailure && (
        <div className="stale-banner stale-banner--partial" role="alert">
          <AlertTriangle className="stale-banner__icon" aria-hidden="true" />
          <div className="stale-banner__content">
            <p className="stale-banner__title">Gangguan Pembacaan Sebagian Sensor</p>
            <p className="stale-banner__desc">
              Sensor <strong>{failedSensors.join(', ')}</strong> mengalami anomali pembacaan atau data tidak valid. Sensor lain tetap dipantau normal.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
