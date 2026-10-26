import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'

const STORAGE_KEYS = {
  THRESHOLDS: 'smartimpact_thresholds_v1',
  PREFERENCES: 'smartimpact_preferences_v1',
}

export const TECHNICAL_LIMITS = {
  temperature: { minPossible: 0, maxPossible: 60, unit: '°C' },
  ph: { minPossible: 0, maxPossible: 20, unit: 'mg/L' },
  turbidity: { minPossible: 0, maxPossible: 20, unit: 'mg/L' },
  tds: { minPossible: 0, maxPossible: 100, unit: 'ppt' },
}

export const DEFAULT_PREFERENCES = {
  refreshIntervalSeconds: 300, // 5 minutes default
  theme: 'light',
  soundAlerts: false,
}

/**
 * Validate numeric threshold inputs against verified technical and physical limits.
 *
 * @param {object} formValues
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateThresholdInputs(formValues) {
  const errors = {}

  // 1. Suhu
  const tempMin = Number(formValues.tempMin)
  const tempMax = Number(formValues.tempMax)
  if (!Number.isFinite(tempMin) || !Number.isFinite(tempMax)) {
    errors.temperature = 'Nilai batas suhu harus berupa angka yang valid.'
  } else if (tempMin < TECHNICAL_LIMITS.temperature.minPossible || tempMax > TECHNICAL_LIMITS.temperature.maxPossible) {
    errors.temperature = `Suhu air tawar harus berada dalam rentang wajar ${TECHNICAL_LIMITS.temperature.minPossible}°C – ${TECHNICAL_LIMITS.temperature.maxPossible}°C.`
  } else if (tempMin >= tempMax) {
    errors.temperature = 'Batas minimum suhu harus lebih kecil dari batas maksimum.'
  }

  // 2. Oksigen Terlarut (DO)
  const phMin = Number(formValues.phMin)
  const phMax = Number(formValues.phMax)
  if (!Number.isFinite(phMin) || !Number.isFinite(phMax)) {
    errors.ph = 'Nilai batas oksigen terlarut harus berupa angka yang valid.'
  } else if (phMin < TECHNICAL_LIMITS.ph.minPossible || phMax > TECHNICAL_LIMITS.ph.maxPossible) {
    errors.ph = `Kadar oksigen terlarut harus berada dalam rentang ${TECHNICAL_LIMITS.ph.minPossible} – ${TECHNICAL_LIMITS.ph.maxPossible} mg/L.`
  } else if (phMin >= phMax) {
    errors.ph = 'Batas minimum oksigen harus lebih kecil dari batas maksimum.'
  }

  // 3. Amonia
  const turbMax = Number(formValues.turbMax)
  if (!Number.isFinite(turbMax)) {
    errors.turbidity = 'Batas amonia harus berupa angka yang valid.'
  } else if (turbMax <= 0 || turbMax > TECHNICAL_LIMITS.turbidity.maxPossible) {
    errors.turbidity = `Batas amonia harus bernilai positif (maksimal ${TECHNICAL_LIMITS.turbidity.maxPossible} mg/L).`
  }

  // 4. Salinitas
  const tdsMax = Number(formValues.tdsMax)
  if (!Number.isFinite(tdsMax)) {
    errors.tds = 'Batas salinitas harus berupa angka yang valid.'
  } else if (tdsMax <= 0 || tdsMax > TECHNICAL_LIMITS.tds.maxPossible) {
    errors.tds = `Batas salinitas harus bernilai positif (maksimal ${TECHNICAL_LIMITS.tds.maxPossible} ppt).`
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Load thresholds from localStorage or fall back to verified default thresholds.
 */
export function loadThresholds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THRESHOLDS)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        thresholds: parsed,
        isCustom: true,
      }
    }
  } catch {
    // Fallback if JSON parse or localStorage fails
  }

  return {
    thresholds: DEFAULT_THRESHOLDS,
    isCustom: false,
  }
}

/**
 * Save thresholds locally with explicit notification that backend sync is not connected.
 *
 * @param {object} thresholdData
 * @returns {{ success: boolean, savedAt: string, storageType: 'localStorage' }}
 */
export function saveThresholdsLocally(thresholdData) {
  try {
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholdData))
    return {
      success: true,
      savedAt: new Date().toISOString(),
      storageType: 'localStorage',
    }
  } catch (err) {
    throw new Error(`Gagal menyimpan ke penyimpanan lokal browser: ${err.message}`)
  }
}

/**
 * Reset thresholds back to verified standard default.
 */
export function resetThresholdsToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEYS.THRESHOLDS)
  } catch {
    // Ignore error
  }
  return DEFAULT_THRESHOLDS
}

/**
 * Load application preferences.
 */
export function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_PREFERENCES
}

/**
 * Save application preferences locally.
 */
export function savePreferencesLocally(prefs) {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs))
    return { success: true, savedAt: new Date().toISOString() }
  } catch (err) {
    throw new Error(`Gagal menyimpan preferensi: ${err.message}`)
  }
}
