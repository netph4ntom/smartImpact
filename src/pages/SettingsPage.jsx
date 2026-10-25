import { useTelemetry } from '../hooks/useTelemetry'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import DeviceCard from '../components/settings/DeviceCard'
import ThresholdConfigForm from '../components/settings/ThresholdConfigForm'
import PreferencesForm from '../components/settings/PreferencesForm'
import PwaInstallGuide from '../components/settings/PwaInstallGuide'
import './SettingsPage.css'

export default function SettingsPage() {
  const { telemetry } = useTelemetry()

  return (
    <div className="settings-page">
      {/* 1. Page Header */}
      <PageHeader
        title="Pengaturan"
        subtitle="Atur preferensi aplikasi, konfigurasi batas sensor, dan informasi perangkat."
        actions={
          <StatusBadge
            variant={telemetry?.connectionStatus === 'online' ? 'normal' : telemetry?.connectionStatus || 'unknown'}
            label={`ESP32: ${telemetry?.connectionLabel || 'Tidak Diketahui'}`}
            size="md"
          />
        }
      />

      <div className="settings-content-flow">
        {/* 2. Device Hardware Information */}
        <DeviceCard telemetry={telemetry} />

        {/* 3. Threshold Configuration Form with Numerical Validation */}
        <ThresholdConfigForm />

        {/* 4. Display Preferences & Refresh Interval Form */}
        <PreferencesForm />

        {/* 5. App Version, PWA Installation Guide, & Mission Banner */}
        <PwaInstallGuide />
      </div>
    </div>
  )
}
