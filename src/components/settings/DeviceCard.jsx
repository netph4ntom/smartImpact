import { Cpu, MapPin, Clock, ShieldCheck, Database } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import './DeviceCard.css'

export default function DeviceCard({ telemetry }) {
  const deviceName = telemetry?.deviceName || 'ESP32'
  const deviceId = telemetry?.deviceId || 'ESP32-001'
  const location = telemetry?.location || 'Sungai Ciliwung'
  const connectionStatus = telemetry?.connectionStatus || 'unknown'
  const connectionLabel = telemetry?.connectionLabel || 'Tidak Diketahui'
  const lastUpdated = telemetry?.formattedReceivedAt || 'Belum ada data'

  return (
    <section className="device-settings-card card" aria-labelledby="heading-device-settings">
      <div className="device-settings-card__header">
        <h2 id="heading-device-settings" className="device-settings-card__title">
          Informasi Perangkat
        </h2>
        <StatusBadge
          variant={connectionStatus === 'online' ? 'normal' : connectionStatus}
          label={connectionLabel}
          size="sm"
        />
      </div>

      <div className="device-settings-card__body">
        <div className="device-settings-card__avatar">
          <Cpu className="device-settings-card__avatar-icon" aria-hidden="true" />
        </div>

        <div className="device-settings-card__meta">
          <h3 className="device-settings-card__name">{deviceName}</h3>
          <span className="device-settings-card__id">ID Perangkat: {deviceId}</span>
          <div className="device-settings-card__detail-row">
            <MapPin className="device-settings-card__row-icon" aria-hidden="true" />
            <span>Lokasi: {location}</span>
          </div>
          <div className="device-settings-card__detail-row">
            <Clock className="device-settings-card__row-icon" aria-hidden="true" />
            <span>Telemetri Terakhir: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Backend & Security Transparency Box (AGENT.md rule) */}
      <div className="device-settings-card__security-box">
        <div className="security-box__item">
          <Database className="security-box__icon" aria-hidden="true" />
          <div className="security-box__text">
            <strong>Sumber Data:</strong>
            <span> Live API (Terhubung ke smartImpact Backend API).</span>
          </div>
        </div>
        <div className="security-box__item">
          <ShieldCheck className="security-box__icon" aria-hidden="true" />
          <div className="security-box__text">
            <strong>Keamanan Kredensial:</strong>
            <span> Token privat Blynk tidak disimpan atau diekspos di browser client.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
