import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TelemetryProvider } from './context/TelemetryContext'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <TelemetryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="riwayat" element={<HistoryPage />} />
            <Route path="pengaturan" element={<SettingsPage />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TelemetryProvider>
  )
}
