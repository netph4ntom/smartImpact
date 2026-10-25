import { TrendingUp, ArrowDown, ArrowUp, BarChart2, AlertCircle } from 'lucide-react'
import './StatsSummary.css'

export default function StatsSummary({ stats, parameterMeta }) {
  const {
    formattedAvg,
    formattedMin,
    formattedMax,
    count,
    hasInvalid,
  } = stats || {}

  const unit = parameterMeta?.unit ? ` ${parameterMeta.unit}` : ''

  const statItems = [
    {
      id: 'avg',
      label: 'Rata-rata',
      value: formattedAvg !== '--' ? `${formattedAvg}${unit}` : '--',
      icon: TrendingUp,
      colorClass: 'stat-card--avg',
    },
    {
      id: 'min',
      label: 'Nilai Minimum',
      value: formattedMin !== '--' ? `${formattedMin}${unit}` : '--',
      icon: ArrowDown,
      colorClass: 'stat-card--min',
    },
    {
      id: 'max',
      label: 'Nilai Maksimum',
      value: formattedMax !== '--' ? `${formattedMax}${unit}` : '--',
      icon: ArrowUp,
      colorClass: 'stat-card--max',
    },
    {
      id: 'count',
      label: 'Titik Sampel',
      value: typeof count === 'number' ? `${count} pembacaan` : '--',
      icon: BarChart2,
      colorClass: 'stat-card--count',
    },
  ]

  return (
    <div className="stats-summary-wrap">
      <div className="stats-grid">
        {statItems.map((item) => {
          const IconComp = item.icon
          return (
            <div key={item.id} className={`stat-card card ${item.colorClass}`}>
              <div className="stat-card__icon-wrap">
                <IconComp className="stat-card__icon" aria-hidden="true" />
              </div>
              <div className="stat-card__content">
                <span className="stat-card__label">{item.label}</span>
                <span className="stat-card__value">{item.value}</span>
              </div>
            </div>
          )
        })}
      </div>

      {hasInvalid && (
        <div className="stats-invalid-alert">
          <AlertCircle className="stats-invalid-alert__icon" aria-hidden="true" />
          <span>
            Beberapa titik pembacaan sensor pada periode ini bernilai tidak valid (NaN/null) dan dikecualikan dari perhitungan statistik.
          </span>
        </div>
      )}
    </div>
  )
}
