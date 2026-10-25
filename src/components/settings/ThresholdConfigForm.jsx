import { useState } from 'react'
import { Sliders, CheckCircle, AlertTriangle, RotateCcw, Info } from 'lucide-react'
import {
  loadThresholds,
  saveThresholdsLocally,
  resetThresholdsToDefault,
  validateThresholdInputs,
  TECHNICAL_LIMITS,
} from '../../services/settingsService'
import './ThresholdConfigForm.css'

export default function ThresholdConfigForm() {
  const [initialData] = useState(() => {
    const { thresholds, isCustom: customFlag } = loadThresholds()
    return {
      isCustom: customFlag,
      values: {
        tempMin: thresholds?.temperature?.min !== undefined ? String(thresholds.temperature.min) : '20',
        tempMax: thresholds?.temperature?.max !== undefined ? String(thresholds.temperature.max) : '30',
        phMin: thresholds?.ph?.min !== undefined ? String(thresholds.ph.min) : '6.5',
        phMax: thresholds?.ph?.max !== undefined ? String(thresholds.ph.max) : '8.5',
        turbMax: thresholds?.turbidity?.max !== undefined ? String(thresholds.turbidity.max) : '5.0',
        tdsMax: thresholds?.tds?.max !== undefined ? String(thresholds.tds.max) : '35',
      },
    }
  })

  const [formData, setFormData] = useState(initialData.values)
  const [errors, setErrors] = useState({})
  const [saveStatus, setSaveStatus] = useState(null) // null | 'success' | 'error' | 'reset'
  const [isCustom, setIsCustom] = useState(initialData.isCustom)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validation = validateThresholdInputs(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      setSaveStatus('error')
      return
    }

    setErrors({})

    const newThresholds = {
      temperature: {
        min: Number(formData.tempMin),
        max: Number(formData.tempMax),
        warnMin: Math.max(0, Number(formData.tempMin) - 2),
        warnMax: Number(formData.tempMax) + 2,
        reference: 'Konfigurasi Lokal Pengguna',
      },
      ph: {
        min: Number(formData.phMin),
        max: Number(formData.phMax),
        warnMin: Math.max(0, Number(formData.phMin) - 0.5),
        warnMax: Math.min(14, Number(formData.phMax) + 0.5),
        reference: 'Konfigurasi Lokal Pengguna',
      },
      turbidity: {
        min: 0,
        max: Number(formData.turbMax),
        warnMin: 0,
        warnMax: Number(formData.turbMax) * 1.5,
        reference: 'Konfigurasi Lokal Pengguna',
      },
      tds: {
        min: 0,
        max: Number(formData.tdsMax),
        warnMin: 0,
        warnMax: Number(formData.tdsMax) * 1.5,
        reference: 'Konfigurasi Lokal Pengguna',
      },
    }

    try {
      saveThresholdsLocally(newThresholds)
      setIsCustom(true)
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
  }

  const handleReset = () => {
    const defaults = resetThresholdsToDefault()
    setFormData({
      tempMin: String(defaults.temperature.min),
      tempMax: String(defaults.temperature.max),
      phMin: String(defaults.ph.min),
      phMax: String(defaults.ph.max),
      turbMax: String(defaults.turbidity.max),
      tdsMax: String(defaults.tds.max),
    })
    setIsCustom(false)
    setErrors({})
    setSaveStatus('reset')
  }

  return (
    <section className="threshold-form-card card" aria-labelledby="heading-thresholds">
      <div className="threshold-form-card__header">
        <div>
          <h2 id="heading-thresholds" className="threshold-form-card__title">
            Konfigurasi Ambang Batas Sensor (Threshold)
          </h2>
          <p className="threshold-form-card__sub">
            Atur batas toleransi normal untuk evaluasi telemetri perairan.
          </p>
        </div>
        <div className="threshold-mode-badge">
          <Sliders className="threshold-mode-badge__icon" aria-hidden="true" />
          <span>{isCustom ? 'Kustom (Lokal)' : 'Default Baku Mutu'}</span>
        </div>
      </div>

      {/* Honest Storage Notice Banner (AGENT.md rule) */}
      <div className="threshold-notice-banner">
        <Info className="threshold-notice-banner__icon" aria-hidden="true" />
        <span>
          <strong>Status Penyimpanan:</strong> Nilai ambang batas disimpan di <em>Local Storage</em> browser pengguna. Sinkronisasi preferensi ke server API akan disinkronkan saat endpoint <code>/settings/thresholds</code> tersedia.
        </span>
      </div>

      {/* Save Status Feedback */}
      {saveStatus === 'success' && (
        <div className="feedback-banner feedback-banner--success" role="status">
          <CheckCircle className="feedback-banner__icon" aria-hidden="true" />
          <span>
            <strong>Berhasil disimpan secara lokal!</strong> Nilai threshold kustom telah tersimpan di browser Anda dan akan digunakan untuk mengevaluasi telemetri sesi ini.
          </span>
        </div>
      )}

      {saveStatus === 'reset' && (
        <div className="feedback-banner feedback-banner--info" role="status">
          <RotateCcw className="feedback-banner__icon" aria-hidden="true" />
          <span>
            Ambang batas telah direset kembali ke standar baku mutu default perairan.
          </span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="feedback-banner feedback-banner--danger" role="alert">
          <AlertTriangle className="feedback-banner__icon" aria-hidden="true" />
          <span>
            Validasi gagal. Periksa kembali nilai numerik yang Anda masukkan di bawah ini.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="threshold-form" noValidate>
        <div className="threshold-grid">
          {/* 1. Suhu Air */}
          <div className="threshold-group">
            <label className="threshold-group__label">
              1. Suhu Air ({TECHNICAL_LIMITS.temperature.unit})
            </label>
            <span className="threshold-group__limit-hint">
              Batas teknis: {TECHNICAL_LIMITS.temperature.minPossible}°C – {TECHNICAL_LIMITS.temperature.maxPossible}°C
            </span>
            <div className="threshold-group__inputs">
              <div className="threshold-input-wrap">
                <span className="threshold-input-prefix">Min:</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tempMin}
                  onChange={(e) => handleChange('tempMin', e.target.value)}
                  className={`threshold-input ${errors.temperature ? 'threshold-input--error' : ''}`}
                  aria-label="Batas minimum suhu air"
                />
              </div>
              <div className="threshold-input-wrap">
                <span className="threshold-input-prefix">Max:</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tempMax}
                  onChange={(e) => handleChange('tempMax', e.target.value)}
                  className={`threshold-input ${errors.temperature ? 'threshold-input--error' : ''}`}
                  aria-label="Batas maksimum suhu air"
                />
              </div>
            </div>
            {errors.temperature && (
              <p className="threshold-error-msg" role="alert">{errors.temperature}</p>
            )}
          </div>

          {/* 2. pH */}
          <div className="threshold-group">
            <label className="threshold-group__label">
              2. Derajat Keasaman (pH)
            </label>
            <span className="threshold-group__limit-hint">
              Skala fisik: 0.0 – 14.0 (Normal netral ~7.0)
            </span>
            <div className="threshold-group__inputs">
              <div className="threshold-input-wrap">
                <span className="threshold-input-prefix">Min:</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.phMin}
                  onChange={(e) => handleChange('phMin', e.target.value)}
                  className={`threshold-input ${errors.ph ? 'threshold-input--error' : ''}`}
                  aria-label="Batas minimum pH"
                />
              </div>
              <div className="threshold-input-wrap">
                <span className="threshold-input-prefix">Max:</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.phMax}
                  onChange={(e) => handleChange('phMax', e.target.value)}
                  className={`threshold-input ${errors.ph ? 'threshold-input--error' : ''}`}
                  aria-label="Batas maksimum pH"
                />
              </div>
            </div>
            {errors.ph && (
              <p className="threshold-error-msg" role="alert">{errors.ph}</p>
            )}
          </div>

          {/* 3. Turbidity */}
          <div className="threshold-group">
            <label className="threshold-group__label">
              3. Kekeruhan (Turbidity)
            </label>
            <span className="threshold-group__limit-hint">
              Batas atas toleransi ({TECHNICAL_LIMITS.turbidity.unit})
            </span>
            <div className="threshold-input-wrap threshold-input-wrap--full">
              <span className="threshold-input-prefix">Maksimum Toleransi:</span>
              <input
                type="number"
                step="0.1"
                value={formData.turbMax}
                onChange={(e) => handleChange('turbMax', e.target.value)}
                className={`threshold-input ${errors.turbidity ? 'threshold-input--error' : ''}`}
                aria-label="Batas maksimum kekeruhan NTU"
              />
              <span className="threshold-input-suffix">NTU</span>
            </div>
            {errors.turbidity && (
              <p className="threshold-error-msg" role="alert">{errors.turbidity}</p>
            )}
          </div>

          {/* 4. Salinitas */}
          <div className="threshold-group">
            <label className="threshold-group__label">
              4. Salinitas Air
            </label>
            <span className="threshold-group__limit-hint">
              Batas atas toleransi ({TECHNICAL_LIMITS.tds.unit})
            </span>
            <div className="threshold-input-wrap threshold-input-wrap--full">
              <span className="threshold-input-prefix">Maksimum Toleransi:</span>
              <input
                type="number"
                step="0.5"
                value={formData.tdsMax}
                onChange={(e) => handleChange('tdsMax', e.target.value)}
                className={`threshold-input ${errors.tds ? 'threshold-input--error' : ''}`}
                aria-label="Batas maksimum Salinitas ppt"
              />
              <span className="threshold-input-suffix">ppt</span>
            </div>
            {errors.tds && (
              <p className="threshold-error-msg" role="alert">{errors.tds}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="threshold-form-actions">
          <button
            type="submit"
            className="threshold-save-btn touch-target"
          >
            Simpan Konfigurasi (Lokal)
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="threshold-reset-btn touch-target"
          >
            Reset ke Default
          </button>
        </div>
      </form>
    </section>
  )
}
