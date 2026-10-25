import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import EmptyState from '../common/EmptyState'
import './OverviewChart.css'

/**
 * Custom Tooltip for Recharts
 */
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">Waktu: {label}</p>
        <div className="chart-tooltip__items">
          {payload.map((entry, index) => (
            <div key={index} className="chart-tooltip__item">
              <span
                className="chart-tooltip__color-indicator"
                style={{ backgroundColor: entry.color }}
              />
              <span className="chart-tooltip__name">{entry.name}:</span>
              <strong className="chart-tooltip__val">
                {entry.value}{' '}
                {entry.name.includes('Suhu')
                  ? '°C'
                  : entry.name.includes('Turbidity')
                    ? 'NTU'
                    : entry.name.includes('Salinitas') || entry.name.includes('TDS')
                      ? 'ppt'
                      : ''}
              </strong>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

/**
 * OverviewChart Component
 * Renders 24h summary chart when history is available.
 * Complies with rule: "Grafik ringkas hanya jika histori tersedia."
 *
 * @param {Array<object>} history - Historical timeline array
 */
export default function OverviewChart({ history = [] }) {
  // If no history data points are available, render graceful EmptyState
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="overview-chart-card card">
        <div className="overview-chart-card__header">
          <h2 className="overview-chart-card__title">
            Grafik Kualitas Air
          </h2>
          <span className="overview-chart-card__sub">
            Histori telemetri berkala
          </span>
        </div>
        <EmptyState
          title="Data Historis Belum Tersedia"
          message="Grafik 24 jam akan muncul secara otomatis setelah server mengumpulkan data periodik dari ESP32."
        />
      </div>
    )
  }

  return (
    <div className="overview-chart-card card" aria-labelledby="chart-title">
      <div className="overview-chart-card__header">
        <div>
          <h2 id="chart-title" className="overview-chart-card__title">
            Grafik Kualitas Air
          </h2>
          <span className="overview-chart-card__sub">
            Tren fluktuasi parameter kualitas air dalam 24 jam
          </span>
        </div>
      </div>

      <div className="overview-chart-container">
        <ResponsiveContainer
          width="100%"
          height={300}
          minWidth={0}
          minHeight={300}
          initialDimension={{ width: 600, height: 300 }}
        >
          <LineChart
            data={history}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="var(--color-text-subtle)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              stroke="var(--color-text-subtle)"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
            />

            {/* Suhu Air */}
            <Line
              type="monotone"
              dataKey="temperature"
              name="Suhu (°C)"
              stroke="#0284C7"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0284C7' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />

            {/* pH */}
            <Line
              type="monotone"
              dataKey="ph"
              name="pH"
              stroke="#0F766E"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0F766E' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />

            {/* Turbidity */}
            <Line
              type="monotone"
              dataKey="turbidity"
              name="Turbidity (NTU)"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#F59E0B' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />

            {/* Salinitas */}
            <Line
              type="monotone"
              dataKey="tds"
              name="Salinitas (ppt)"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#8B5CF6' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
