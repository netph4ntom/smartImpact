import { liveApiAdapter } from './adapters/liveApiAdapter.js'
import { SENSOR_METADATA, evaluateSensorStatus } from '../utils/thresholds.js'
import { formatSensorValue, formatTimestamp } from '../utils/formatters.js'
import { determineFreshness, assessTelemetryHealth } from '../utils/telemetry.js'

/**
 * Helper to safely extract numeric sensor value and unit from diverse backend payload shapes.
 */
function extractSensorValueAndUnit(payload, key, meta) {
  const rawSensors = payload.sensors || {}

  // Shape 1: Array of sensor objects e.g. [{ id: 'temperature', value: 25.4, unit: '°C' }]
  if (Array.isArray(rawSensors)) {
    const found = rawSensors.find(
      (s) => s && (s.id === key || s.name?.toLowerCase() === meta.name.toLowerCase() || s.key === key),
    )
    if (found) {
      const raw = found.value !== undefined ? found.value : found.rawValue
      const num = raw !== null && raw !== undefined && raw !== '' ? Number(raw) : null
      return {
        value: Number.isFinite(num) ? num : null,
        unit: found.unit !== undefined ? found.unit : meta.unit,
        sparkline: Array.isArray(found.sparkline) ? found.sparkline : null,
      }
    }
  }

  // Shape 2: Object map e.g. { temperature: { value: 25.4 } } or { temperature: 25.4 }
  if (typeof rawSensors === 'object' && rawSensors !== null && key in rawSensors) {
    const entry = rawSensors[key]
    if (typeof entry === 'object' && entry !== null) {
      const raw = entry.value !== undefined ? entry.value : entry.rawValue
      const num = raw !== null && raw !== undefined && raw !== '' ? Number(raw) : null
      return {
        value: Number.isFinite(num) ? num : null,
        unit: entry.unit !== undefined ? entry.unit : meta.unit,
        sparkline: Array.isArray(entry.sparkline) ? entry.sparkline : null,
      }
    }
    const num = entry !== null && entry !== undefined && entry !== '' ? Number(entry) : null
    return {
      value: Number.isFinite(num) ? num : null,
      unit: meta.unit,
      sparkline: null,
    }
  }

  // Shape 3: Flat properties on root payload (e.g. payload.temp, payload.suhu, payload.turbiditas, virtual pins v0-v3)
  const aliasMap = {
    temperature: ['temperature', 'temp', 'suhu', 'temp_c', 'v0', 'V0'],
    ph: ['oksigen', 'oxygen', 'do', 'dissolved_oxygen', 'o2', 'ph', 'ph_level', 'derajat_keasaman', 'v1', 'V1'],
    turbidity: ['amonia', 'ammonia', 'nh3', 'nh4', 'turbidity', 'kekeruhan', 'turb', 'v2', 'V2'],
    tds: ['salinitas', 'salinity', 'ppt', 'tds', 'ppm', 'total_dissolved_solids', 'v3', 'V3'],
  }

  const aliases = aliasMap[key] || [key]
  for (const alias of aliases) {
    if (payload[alias] !== undefined) {
      const entry = payload[alias]
      if (typeof entry === 'object' && entry !== null) {
        const raw = entry.value !== undefined ? entry.value : entry.rawValue
        const num = raw !== null && raw !== undefined && raw !== '' ? Number(raw) : null
        return {
          value: Number.isFinite(num) ? num : null,
          unit: entry.unit !== undefined ? entry.unit : meta.unit,
          sparkline: Array.isArray(entry.sparkline) ? entry.sparkline : null,
        }
      }
      const num = entry !== null && entry !== undefined && entry !== '' ? Number(entry) : null
      return {
        value: Number.isFinite(num) ? num : null,
        unit: meta.unit,
        sparkline: null,
      }
    }
  }

  return {
    value: null,
    unit: meta.unit,
    sparkline: null,
  }
}

/**
 * Normalizes raw telemetry payload into standard smartImpact internal model.
 * Complies strictly with AGENT.md Section 8.
 *
 * @param {object} payload - Raw payload from live backend
 * @returns {object} Standardized internal telemetry model
 */
export function normalizeTelemetry(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload telemetri kosong atau tidak valid.')
  }

  const {
    deviceId = payload.device_id || 'ESP32-001',
    deviceName = payload.device_name || 'ESP32',
    location = 'Politeknik Negeri Banyuwangi',
    history = [],
    useCustomThresholds = undefined,
  } = payload

  // Extract timestamp across standard field names
  const receivedAt =
    payload.receivedAt ||
    payload.timestamp ||
    payload.updated_at ||
    payload.time ||
    payload.date ||
    null

  // 1. Determine connection freshness from timestamp evidence
  const freshness = determineFreshness(receivedAt)

  // 2. Normalize 4 physical water sensors
  const sensorKeys = ['temperature', 'ph', 'turbidity', 'tds']
  const normalizedSensors = sensorKeys.map((key) => {
    const meta = SENSOR_METADATA[key]
    const extracted = extractSensorValueAndUnit(payload, key, meta)
    const rawValue = extracted.value

    // Determine custom threshold override if provided
    const thresholdOverride = useCustomThresholds ? useCustomThresholds[key] : undefined
    const evaluation = evaluateSensorStatus(rawValue, key, thresholdOverride)

    return {
      id: key,
      name: meta.name,
      unit: extracted.unit,
      value: rawValue,
      rawValue,
      formattedValue: formatSensorValue(rawValue, meta.decimals),
      valid: evaluation.valid,
      status: evaluation.status,
      statusLabel: evaluation.label,
      reason: evaluation.reason,
      updatedAt: formatTimestamp(receivedAt),
      sparkline: extracted.sparkline,
    }
  })

  // 3. Assess partial failure
  const health = assessTelemetryHealth(normalizedSensors)

  return {
    deviceId: String(deviceId),
    deviceName: String(deviceName),
    location: String(location),
    receivedAt,
    formattedReceivedAt: formatTimestamp(receivedAt),
    connectionStatus: freshness.status, // 'online' | 'stale' | 'offline' | 'unknown'
    connectionLabel: freshness.label,
    isStale: freshness.isStale,
    ageMinutes: freshness.ageMinutes,
    sensors: normalizedSensors,
    hasPartialFailure: health.hasPartialFailure,
    failedSensors: health.failedSensors,
    history: Array.isArray(history) ? history : [],
    isMock: false,
    source: 'live_api',
  }
}

/**
 * Fetch latest telemetry from live backend API.
 *
 * @param {object} [options] - Supports { signal } for cancellation
 * @returns {Promise<object>}
 */
export async function fetchLatestTelemetry(options = {}) {
  const rawData = await liveApiAdapter.getLatestTelemetry(undefined, options)
  return normalizeTelemetry(rawData)
}

/**
 * Fetch historical data from live backend API.
 *
 * @param {object} query - { parameter, range }
 * @param {object} [options] - Supports { signal } for cancellation
 * @returns {Promise<object>}
 */
export async function fetchHistory(query = {}, options = {}) {
  return liveApiAdapter.getHistory(query, options)
}
