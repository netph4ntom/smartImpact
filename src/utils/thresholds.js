/**
 * thresholds.js
 * Parameter metadata & threshold evaluation rules.
 *
 * Rules from AGENT.md:
 * - Ambang batas harus dapat dikonfigurasi.
 * - Jangan menetapkan status normal universal; jika threshold belum ditentukan,
 *   tampilkan "Batas belum diatur" atau "Status belum dapat dinilai".
 * - Jangan mengklaim air aman diminum hanya dari 4 parameter ini.
 * - Dilarang mengasumsikan nilai invalid sebagai normal.
 */

export const SENSOR_METADATA = {
  temperature: {
    id: 'temperature',
    name: 'Suhu Air',
    unit: '°C',
    decimals: 1,
    description: 'Suhu fisik perairan',
    iconType: 'thermometer',
  },
  ph: {
    id: 'ph',
    name: 'Oksigen',
    unit: 'mg/L',
    decimals: 1,
    description: 'Kadar oksigen terlarut (DO) dalam air tambak',
    iconType: 'activity',
  },
  turbidity: {
    id: 'turbidity',
    name: 'Amonia',
    unit: 'mg/L',
    decimals: 2,
    description: 'Kadar amonia terlarut dalam air tambak',
    iconType: 'waves',
  },
  tds: {
    id: 'tds',
    name: 'Salinitas',
    unit: 'ppt',
    decimals: 1,
    description: 'Kadar garam atau salinitas air perairan/tambak',
    iconType: 'droplets',
  },
}

/**
 * Default sample thresholds for water quality monitoring.
 * Set to null if thresholds are not yet configured.
 */
export const DEFAULT_THRESHOLDS = {
  temperature: {
    min: 20,
    max: 30,
    warnMin: 18,
    warnMax: 32,
    reference: 'Baku mutu air sungai/danau kelas 2',
  },
  ph: {
    min: 4.0,
    max: 10.0,
    warnMin: 3.0,
    warnMax: 15.0,
    reference: 'Standar baku mutu oksigen terlarut (DO) air tambak',
  },
  turbidity: {
    min: 0,
    max: 0.1,
    warnMin: 0,
    warnMax: 0.5,
    reference: 'Standar batas aman amonia air tambak budidaya',
  },
  tds: {
    min: 0,
    max: 35,
    warnMin: 0,
    warnMax: 40,
    reference: 'Standar batas salinitas air tambak budidaya',
  },
}

/**
 * Evaluate sensor reading status against configured thresholds.
 *
 * @param {number | null | undefined} rawValue
 * @param {string} paramKey - 'temperature' | 'ph' | 'turbidity' | 'tds'
 * @param {object | null} [customThreshold] - Optional override threshold
 * @returns {{
 *   status: 'normal' | 'warning' | 'danger' | 'unknown',
 *   label: string,
 *   valid: boolean,
 *   reason?: string
 * }}
 */
export function evaluateSensorStatus(rawValue, paramKey, customThreshold = undefined) {
  // 1. Check for missing data
  if (rawValue === null || rawValue === undefined) {
    return {
      status: 'unknown',
      label: 'Belum ada data',
      valid: false,
      reason: 'Sensor belum mengirim pembacaan.',
    }
  }

  const num = Number(rawValue)

  // 2. Check for non-numeric or infinite readings
  if (!Number.isFinite(num)) {
    return {
      status: 'danger',
      label: 'Nilai Tidak Valid',
      valid: false,
      reason: 'Pembacaan sensor di luar jangkauan fisik atau sensor error.',
    }
  }

  // 3. Resolve threshold (can be null if not configured)
  const threshold = customThreshold !== undefined ? customThreshold : DEFAULT_THRESHOLDS[paramKey]

  if (!threshold) {
    return {
      status: 'unknown',
      label: 'Batas belum diatur',
      valid: true,
      reason: 'Threshold untuk parameter ini belum dikonfigurasi.',
    }
  }

  const { min, max, warnMin, warnMax } = threshold

  // 4. Critical out of bounds
  if ((typeof warnMin === 'number' && num < warnMin) || (typeof warnMax === 'number' && num > warnMax)) {
    return {
      status: 'danger',
      label: 'Kritis',
      valid: true,
      reason: num > warnMax ? 'Melampaui batas atas maksimal' : 'Di bawah batas bawah minimal',
    }
  }

  // 5. Warning range
  if ((typeof min === 'number' && num < min) || (typeof max === 'number' && num > max)) {
    return {
      status: 'warning',
      label: 'Perhatian',
      valid: true,
      reason: num > max ? 'Mendekati batas atas' : 'Mendekati batas bawah',
    }
  }

  // 6. Normal
  return {
    status: 'normal',
    label: 'Normal',
    valid: true,
    reason: 'Parameter berada dalam rentang toleransi standar.',
  }
}
