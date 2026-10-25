import { Link } from 'react-router-dom'
import { Thermometer, Activity, Waves, Droplets, ChevronRight } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import './SensorCard.css'

const SENSOR_ICONS = {
  temperature: Thermometer,
  ph: Activity,
  turbidity: Waves,
  tds: Droplets,
}

/**
 * SensorCard Component
 * Reusable card for physical water quality sensors (Temperature, pH, Turbidity, TDS).
 *
 * @param {object} sensor - Normalized sensor object
 * @param {string} [lastUpdated] - Optional timestamp fallback
 */
export default function SensorCard({ sensor }) {
  if (!sensor) return null

  const {
    id,
    name,
    formattedValue,
    unit,
    status,
    statusLabel,
    updatedAt,
    sparkline,
    valid,
    reason,
  } = sensor

  const IconComp = SENSOR_ICONS[id] || Droplets

  // Generate SVG Sparkline points if sparkline array exists
  const renderSparkline = () => {
    if (!Array.isArray(sparkline) || sparkline.length < 2) return null

    const min = Math.min(...sparkline)
    const max = Math.max(...sparkline)
    const range = max - min || 1
    const width = 80
    const height = 24

    const points = sparkline
      .map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 4) - 2
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

    return (
      <svg
        className="sensor-card__sparkline"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    )
  }

  return (
    <article className="sensor-card card" aria-labelledby={`sensor-title-${id}`}>
      {/* Top Header Row */}
      <div className="sensor-card__top">
        <div className="sensor-card__icon-wrap">
          <IconComp className="sensor-card__icon" aria-hidden="true" />
        </div>
        <div className="sensor-card__title-wrap">
          <h2 id={`sensor-title-${id}`} className="sensor-card__name">
            {name}
          </h2>
        </div>
        {/* Link from Card to Riwayat with parameter */}
        <Link
          to={`/riwayat?parameter=${id}`}
          className="sensor-card__history-link touch-target"
          aria-label={`Lihat riwayat lengkap ${name}`}
          title={`Lihat riwayat ${name}`}
        >
          <ChevronRight className="sensor-card__link-icon" aria-hidden="true" />
        </Link>
      </div>

      {/* Main Measurement Row */}
      <div className="sensor-card__body">
        <div className="sensor-card__value-group">
          <span
            className={`sensor-card__value ${!valid ? 'sensor-card__value--invalid' : ''}`}
          >
            {formattedValue}
          </span>
          {unit && valid && (
            <span className="sensor-card__unit" aria-label={`Satuan ${unit}`}>
              {unit}
            </span>
          )}
        </div>

        {/* Sparkline trend or mini status */}
        <div className="sensor-card__trend">
          {renderSparkline()}
        </div>
      </div>

      {/* Status Badge & Timestamp Footer */}
      <div className="sensor-card__footer">
        <div className="sensor-card__badge-row">
          <StatusBadge variant={status} label={statusLabel} size="sm" />
          {reason && status !== 'normal' && (
            <span className="sensor-card__reason-hint" title={reason}>
              {reason}
            </span>
          )}
        </div>

        <span className="sensor-card__updated">
          Terakhir diperbarui: {updatedAt}
        </span>
      </div>
    </article>
  )
}
