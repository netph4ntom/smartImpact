import { useState } from 'react'
import { Clock, Sun, Gauge, CheckCircle } from 'lucide-react'
import { loadPreferences, savePreferencesLocally } from '../../services/settingsService'
import './PreferencesForm.css'

export default function PreferencesForm() {
  const [preferences, setPreferences] = useState(() => loadPreferences())
  const [savedStatus, setSavedStatus] = useState(false)

  const handleIntervalChange = (newSeconds) => {
    const updated = { ...preferences, refreshIntervalSeconds: Number(newSeconds) }
    setPreferences(updated)
    savePreferencesLocally(updated)
    setSavedStatus(true)
    setTimeout(() => setSavedStatus(false), 2500)
  }

  const intervalOptions = [
    { value: 10, label: '10 Detik (Uji Cepat)' },
    { value: 30, label: '30 Detik' },
    { value: 60, label: '1 Menit' },
    { value: 300, label: '5 Menit (Standar)' },
  ]

  return (
    <section className="preferences-card card" aria-labelledby="heading-preferences">
      <div className="preferences-card__header">
        <h2 id="heading-preferences" className="preferences-card__title">
          Pengaturan Tampilan & Pembaruan
        </h2>
        {savedStatus && (
          <span className="pref-saved-indicator" role="status">
            <CheckCircle className="pref-saved-indicator__icon" aria-hidden="true" />
            Preferensi tersimpan
          </span>
        )}
      </div>

      <div className="preferences-list">
        {/* 1. Interval Refresh */}
        <div className="pref-item">
          <div className="pref-item__left">
            <div className="pref-item__icon-wrap">
              <Clock className="pref-item__icon" aria-hidden="true" />
            </div>
            <div>
              <label htmlFor="pref-interval-select" className="pref-item__label">
                Interval Pembaruan Data
              </label>
              <p className="pref-item__desc">
                Frekuensi penyegaran telemetri latar belakang
              </p>
            </div>
          </div>
          <div className="pref-item__right">
            <select
              id="pref-interval-select"
              value={preferences.refreshIntervalSeconds}
              onChange={(e) => handleIntervalChange(e.target.value)}
              className="pref-select"
              aria-label="Pilih interval pembaruan data"
            >
              {intervalOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Tema */}
        <div className="pref-item">
          <div className="pref-item__left">
            <div className="pref-item__icon-wrap">
              <Sun className="pref-item__icon" aria-hidden="true" />
            </div>
            <div>
              <span className="pref-item__label">Tema Visual</span>
              <p className="pref-item__desc">
                Mode terang dengan palet warna teal terkurasi
              </p>
            </div>
          </div>
          <div className="pref-item__right">
            <span className="pref-badge">Light (Aktif)</span>
          </div>
        </div>

        {/* 3. Satuan Metrik */}
        <div className="pref-item">
          <div className="pref-item__left">
            <div className="pref-item__icon-wrap">
              <Gauge className="pref-item__icon" aria-hidden="true" />
            </div>
            <div>
              <span className="pref-item__label">Satuan Sensor</span>
              <p className="pref-item__desc">
                Standar Satuan Internasional: °C, pH, NTU, ppm
              </p>
            </div>
          </div>
          <div className="pref-item__right">
            <span className="pref-badge">Standar SI</span>
          </div>
        </div>
      </div>
    </section>
  )
}
