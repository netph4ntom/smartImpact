import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw, Download } from 'lucide-react'
import { useTelemetry } from '../hooks/useTelemetry'
import { fetchHistory } from '../services/telemetryService'
import { SENSOR_METADATA } from '../utils/thresholds.js'
import { exportHistoryParameterCsv } from '../utils/csvExport.js'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import ParameterSelector from '../components/history/ParameterSelector'
import TimeRangeSelector from '../components/history/TimeRangeSelector'
import StatsSummary from '../components/history/StatsSummary'
import SingleMetricChart from '../components/history/SingleMetricChart'
import HistoryTable from '../components/history/HistoryTable'
import './HistoryPage.css'

export default function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { telemetry } = useTelemetry()

  // Read parameter and range from URL query params (default: temperature, 24h)
  const currentParam = searchParams.get('parameter') || 'temperature'
  const currentRange = searchParams.get('range') || '24h'

  const [historyResult, setHistoryResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function executeLoad() {
      try {
        const result = await fetchHistory(
          {
            parameter: currentParam,
            range: currentRange,
          },
          { signal: controller.signal },
        )
        if (!controller.signal.aborted) {
          setHistoryResult(result)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Gagal memuat catatan historis.')
          setHistoryResult(null)
          setLoading(false)
        }
      }
    }

    executeLoad()

    return () => {
      controller.abort()
    }
  }, [currentParam, currentRange, reloadTrigger])

  // Handle parameter tab selection and sync to URL
  const handleSelectParameter = (newParam) => {
    setLoading(true)
    setError(null)
    setSearchParams({ parameter: newParam, range: currentRange })
  }

  // Handle range selection and sync to URL
  const handleSelectRange = (newRange) => {
    setLoading(true)
    setError(null)
    setSearchParams({ parameter: currentParam, range: newRange })
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setReloadTrigger((prev) => prev + 1)
  }

  const parameterMeta = historyResult?.parameterMeta || SENSOR_METADATA[currentParam] || {
    id: currentParam,
    name: currentParam,
    unit: '',
  }

  const rangeLabels = {
    '1h': '1 jam',
    '24h': '24 jam',
    '7d': '7 hari',
  }
  const rangeDisplay = rangeLabels[currentRange] || currentRange

  const handleDownloadCsv = () => {
    if (!historyResult?.dataPoints || historyResult.dataPoints.length === 0) {
      alert('Belum ada data riwayat yang dapat diunduh.')
      return
    }
    exportHistoryParameterCsv(
      parameterMeta,
      historyResult.dataPoints,
      currentRange,
      telemetry?.deviceName || 'ESP32',
    )
  }

  return (
    <div className="history-page">
      {/* 1. Page Header */}
      <PageHeader
        title="Riwayat"
        subtitle="Lihat data historis kualitas air berdasarkan parameter dan periode waktu."
        actions={
          <div className="history-header-actions">
            <TimeRangeSelector
              selectedRange={currentRange}
              onSelectRange={handleSelectRange}
            />
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="history-download-csv-btn touch-target"
              disabled={loading || !historyResult?.dataPoints?.length}
              title={`Unduh riwayat data ${parameterMeta.name} (${rangeDisplay}) dalam format CSV`}
            >
              <Download className="history-download-icon" aria-hidden="true" />
              <span>Unduh CSV</span>
            </button>
          </div>
        }
      />

      {/* 2. Parameter Selector Tabs (Suhu, pH, Turbidity, TDS) */}
      <ParameterSelector
        selectedParameter={currentParam}
        onSelectParameter={handleSelectParameter}
      />

      {/* 3. Stale Notice if telemetry freshness is late */}
      {telemetry?.isStale && (
        <div className="history-stale-notice">
          <RefreshCw className="history-stale-notice__icon" aria-hidden="true" />
          <span>
            Catatan: Perangkat ESP32 sedang terlambat mengirimkan telemetri ({telemetry.formattedReceivedAt}). Data historis menampilkan rekaman terakhir yang tersimpan.
          </span>
        </div>
      )}

      {/* 4. Dynamic Content Views (Loading, Error, Normal) */}
      {loading ? (
        <div className="history-loading-view" aria-live="polite">
          <LoadingState
            message={`Memuat riwayat ${parameterMeta.name} untuk rentang ${rangeDisplay}...`}
          />
        </div>
      ) : error ? (
        <div className="history-error-view">
          <ErrorState
            title="Gagal Mengambil Data Riwayat"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      ) : (
        <div className="history-content-flow">
          {/* A. Statistics Summary (Min, Max, Avg, Count strictly from selected dataset) */}
          <StatsSummary
            stats={historyResult?.stats}
            parameterMeta={parameterMeta}
          />

          {/* B. Single Metric Line Chart (Single Parameter on Single Y-Axis) */}
          <SingleMetricChart
            dataPoints={historyResult?.dataPoints}
            parameterMeta={parameterMeta}
            range={currentRange}
          />

          {/* C. Table of Recent Readings (Responsive) */}
          <HistoryTable
            dataPoints={historyResult?.dataPoints}
            parameterMeta={parameterMeta}
            onDownloadCsv={handleDownloadCsv}
          />
        </div>
      )}
    </div>
  )
}
