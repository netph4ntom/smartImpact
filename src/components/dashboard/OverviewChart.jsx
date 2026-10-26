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
                {entry.value !== null && entry.value !== undefined ? entry.value : '--'}{' '}
                {entry.name.includes('Suhu')
                  ? '°C'
                  : entry.name.includes('Oksigen') || entry.name.includes('pH') || entry.name.includes('Amonia') || entry.name.includes('Turbidity')
                    ? 'mg/L'
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
 * Renders real-time rolling summary chart with sliding window (FIFO).
 * Complies with user requirement:
 * "Trafiknya di mobile ui tidak menumpuk, tetap jalan, dan sumbu waktu rapi."
 *
 * @param {Array<object>} history - Historical timeline array
 */
export default function OverviewChart({ history = [] }) {
  // If no history data points are available, render graceful EmptyState
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="overview-chart-card card">
        <div className="overview-chart-card__header">
          <div>
            <h2 className="overview-chart-card__title">
              Grafik Kualitas Air
            </h2>
            <span className="overview-chart-card__sub">
              Pencatatan telemetri real-time
            </span>
          </div>
        </div>
        <EmptyState
          title="Menunggu Telemetri Perangkat"
          message="Grafik real-time akan langsung muncul begitu data telemetri pertama dari ESP32 diterima."
        />
      </div>
    )
  }

  // Sliding window: display latest 15 points to keep mobile chart uncluttered & flowing
  const displayHistory = history.length > 15 ? history.slice(-15) : history

  return (
    <div className="overview-chart-card card" aria-labelledby="chart-title">
      <div className="overview-chart-card__header">
        <div>
          <div className="overview-chart-card__title-wrap">
            <h2 id="chart-title" className="overview-chart-card__title">
              Grafik Kualitas Air
            </h2>
            <span className="live-stream-badge">
              <span className="live-stream-dot" aria-hidden="true" />
              Live Telemetri
            </span>
          </div>
          <span className="overview-chart-card__sub">
            Pencatatan tren real-time ({displayHistory.length} titik data)
          </span>
        </div>
      </div>

      <div className="overview-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={240}
        >
          <LineChart
            data={displayHistory}
            margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="var(--color-text-subtle)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              interval="preserveStartEnd"
              minTickGap={28}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            />
            <YAxis
              stroke="var(--color-text-subtle)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              width={32}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
            />

            {/* Suhu Air */}
            <Line
              type="monotone"
              dataKey="temperature"
              name="Suhu (°C)"
              stroke="#0284C7"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              isAnimationActive={false}
            />

            {/* Oksigen Terlarut */}
            <Line
              type="monotone"
              dataKey="ph"
              name="Oksigen (mg/L)"
              stroke="#0F766E"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              isAnimationActive={false}
            />

            {/* Amonia */}
            <Line
              type="monotone"
              dataKey="turbidity"
              name="Amonia (mg/L)"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              isAnimationActive={false}
            />

            {/* Salinitas */}
            <Line
              type="monotone"
              dataKey="tds"
              name="Salinitas (ppt)"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
