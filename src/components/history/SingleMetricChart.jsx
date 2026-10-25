import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Info } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import StatusBadge from '../common/StatusBadge'
import './SingleMetricChart.css'

/**
 * Custom Tooltip for Single Metric Line Chart
 */
function HistoryChartTooltip({ active, payload, parameterMeta }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const unit = parameterMeta?.unit ? ` ${parameterMeta.unit}` : ''

    return (
      <div className="history-tooltip">
        <p className="history-tooltip__time">{data.formattedTime || data.timestamp}</p>
        <div className="history-tooltip__row">
          <span className="history-tooltip__name">{parameterMeta?.name}:</span>
          <strong className="history-tooltip__value">
            {data.value !== null && Number.isFinite(Number(data.value)) ? `${data.value}${unit}` : 'Tidak Valid'}
          </strong>
        </div>
        {data.evaluation && (
          <div className="history-tooltip__badge">
            <StatusBadge
              variant={data.evaluation.status}
              label={data.evaluation.label}
              size="sm"
            />
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function SingleMetricChart({
  dataPoints = [],
  parameterMeta,
  range = '24h',
}) {
  const paramId = parameterMeta?.id || 'temperature'
  const unit = parameterMeta?.unit || ''

  // Color mapping per parameter
  const colors = {
    temperature: '#0284C7',
    ph: '#0F766E',
    turbidity: '#F59E0B',
    tds: '#8B5CF6',
  }

  const primaryColor = colors[paramId] || '#0F766E'

  // Empty Data Point Handling
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    return (
      <div className="single-metric-card card">
        <EmptyState
          title={`Belum Ada Riwayat ${parameterMeta?.name || 'Parameter'}`}
          message={`Tidak ditemukan catatan data untuk rentang waktu ${range === '1h' ? '1 Jam Terakhir' : range === '24h' ? '24 Jam Terakhir' : '7 Hari Terakhir'}.`}
        />
      </div>
    )
  }

  const isSinglePoint = dataPoints.length === 1

  return (
    <div
      id="history-chart-panel"
      className="single-metric-card card"
      role="region"
      aria-label={`Grafik Riwayat ${parameterMeta?.name}`}
    >
      <div className="single-metric-card__header">
        <div>
          <h2 className="single-metric-card__title">
            Grafik {parameterMeta?.name} ({range === '1h' ? '1 Jam Terakhir' : range === '24h' ? '24 Jam Terakhir' : '7 Hari Terakhir'})
          </h2>
          <span className="single-metric-card__sub">
            Sumbu Y: Pembacaan sensor dalam satuan {unit || 'skala relatif'}
          </span>
        </div>
      </div>

      {isSinglePoint && (
        <div className="single-point-notice">
          <Info className="single-point-notice__icon" aria-hidden="true" />
          <span>
            Hanya terdapat 1 titik data pada periode ini ({dataPoints[0].formattedTime}: <strong>{dataPoints[0].value} {unit}</strong>).
          </span>
        </div>
      )}

      <div className="single-metric-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={240}
        >
          <LineChart
            data={dataPoints}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
            <XAxis
              dataKey="displayLabel"
              stroke="var(--color-text-subtle)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            />
            <YAxis
              stroke="var(--color-text-subtle)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              width={36}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={<HistoryChartTooltip parameterMeta={parameterMeta} />}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={parameterMeta?.name}
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={
                isSinglePoint
                  ? { r: 6, fill: primaryColor }
                  : dataPoints.length <= 10
                    ? { r: 2.5, fill: primaryColor }
                    : false
              }
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              connectNulls={false} // Does not connect through invalid/null readings
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
