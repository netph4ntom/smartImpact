import { Link } from 'react-router-dom'
import { Cpu, MapPin, ExternalLink } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import './DeviceWidget.css'

/**
 * DeviceWidget Component
 * Displays summary metadata for the connected ESP32 sensor hardware.
 */
export default function DeviceWidget({
  deviceId = 'ESP32-001',
  deviceName = 'ESP32',
  location = 'Sungai Ciliwung',
  connectionStatus = 'online',
  connectionLabel = 'Online',
  lastUpdated = '12 Jun 2025, 14:32',
}) {
  return (
    <article className="device-widget card" aria-labelledby="device-widget-title">
      <div className="device-widget__header">
        <h2 id="device-widget-title" className="device-widget__heading">
          Perangkat IoT
        </h2>
        <StatusBadge
          variant={connectionStatus === 'online' ? 'normal' : connectionStatus}
          label={connectionLabel}
          size="sm"
        />
      </div>

      <div className="device-widget__body">
        {/* Hardware chip avatar */}
        <div className="device-widget__chip-avatar">
          <Cpu className="device-widget__chip-icon" aria-hidden="true" />
        </div>

        <div className="device-widget__info">
          <h3 className="device-widget__name">{deviceName}</h3>
          <p className="device-widget__id">ID: {deviceId}</p>
          <span className="device-widget__time">Terakhir update: {lastUpdated}</span>
        </div>
      </div>

      {/* Location card */}
      <div className="device-widget__location-card">
        <div className="device-widget__loc-header">
          <MapPin className="device-widget__loc-icon" aria-hidden="true" />
          <span className="device-widget__loc-label">Lokasi Pemantauan</span>
        </div>
        <p className="device-widget__loc-name">{location}</p>
      </div>

      {/* Direct link to Settings */}
      <div className="device-widget__footer">
        <Link
          to="/pengaturan"
          className="device-widget__settings-link touch-target"
          aria-label="Buka pengaturan perangkat"
        >
          <span>Konfigurasi Perangkat</span>
          <ExternalLink className="device-widget__link-icon" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
