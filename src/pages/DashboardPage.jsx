import { RotateCcw } from 'lucide-react'
import { useTelemetry } from '../hooks/useTelemetry'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import StaleBanner from '../components/common/StaleBanner'
import SensorCard from '../components/dashboard/SensorCard'
import OverviewChart from '../components/dashboard/OverviewChart'
import DeviceWidget from '../components/dashboard/DeviceWidget'
import './DashboardPage.css'

export default function DashboardPage() {
  const {
    telemetry,
    loading,
    error,
    refreshWarning,
    isBrowserOnline,
    retry,
  } = useTelemetry()

  return (
    <div className="dashboard-page">
      {/* 1. Page Header */}
      <PageHeader
        title="Halo, Pengguna 👋"
        subtitle="Pantau kondisi kualitas air secara real-time dari perangkat IoT Anda."
      />

      {/* 2. Telemetry Stale / Offline / Browser Offline / Partial Failure Banner */}
      <StaleBanner
        connectionStatus={telemetry?.connectionStatus || 'unknown'}
        ageMinutes={telemetry?.ageMinutes}
        hasPartialFailure={telemetry?.hasPartialFailure}
        failedSensors={telemetry?.failedSensors}
        formattedReceivedAt={telemetry?.formattedReceivedAt}
        isBrowserOnline={isBrowserOnline}
        refreshWarning={refreshWarning}
      />

      {/* 3. Main Content Area handling Loading, Error, Empty, and Normal states */}
      {loading ? (
        <div className="dashboard-loading-view" aria-live="polite">
          <LoadingState type="skeleton" skeletonCount={4} message="Memuat pembacaan sensor terbaru..." />
        </div>
      ) : error ? (
        <div className="dashboard-error-view">
          <ErrorState
            title="Gagal Memuat Telemetri"
            message={error}
            onRetry={retry}
          />
        </div>
      ) : !telemetry || !Array.isArray(telemetry.sensors) || telemetry.sensors.length === 0 ? (
        <div className="dashboard-empty-view">
          <EmptyState
            title="Belum Ada Data Pembacaan Sensor"
            message="Data telemetri akan tampil secara otomatis setelah ESP32 mengirimkan pembacaan data pertama."
            action={
              <button
                type="button"
                className="empty-reload-btn touch-target"
                onClick={retry}
              >
                <RotateCcw className="empty-reload-icon" aria-hidden="true" />
                <span>Muat Ulang Data</span>
              </button>
            }
          />
        </div>
      ) : (
        <div className="dashboard-content-grid">
          {/* A. 4 Reusable Sensor Cards (Desktop 4-col, Tablet 2-col, Mobile 2 or 1-col) */}
          <section className="dashboard-sensors-section" aria-label="Empat Parameter Sensor">
            <div className="grid-4col dashboard-cards-grid">
              {telemetry.sensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </div>
          </section>

          {/* B. Bottom Layout Grid: 24h Summary Chart & ESP32 Device Widget */}
          <section className="dashboard-bottom-grid" aria-label="Ringkasan Historis dan Info Perangkat">
            {/* Overview 24h Chart (renders only if history is available, otherwise EmptyState inside) */}
            <div className="dashboard-chart-col">
              <OverviewChart history={telemetry.history} />
            </div>

            {/* ESP32 Hardware Device Widget */}
            <div className="dashboard-device-col">
              <DeviceWidget
                deviceId={telemetry.deviceId}
                deviceName={telemetry.deviceName}
                location={telemetry.location}
                connectionStatus={telemetry.connectionStatus}
                connectionLabel={telemetry.connectionLabel}
                lastUpdated={telemetry.formattedReceivedAt}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
