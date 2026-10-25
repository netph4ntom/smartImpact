import { apiClient, ApiError } from '../apiClient.js'
import { API_CONFIG } from '../apiConfig.js'
import { SENSOR_METADATA, evaluateSensorStatus } from '../../utils/thresholds.js'
import { formatTimestamp } from '../../utils/formatters.js'
import { calculateDatasetStats, sortChronologically } from '../historyService.js'

/**
 * Normalizes raw historical points from backend response into standard smartImpact history model.
 */
function normalizeHistoryPayload(data, parameter, range) {
  const meta = SENSOR_METADATA[parameter] || SENSOR_METADATA.temperature
  const rawPoints = Array.isArray(data)
    ? data
    : Array.isArray(data.dataPoints)
      ? data.dataPoints
      : Array.isArray(data.points)
        ? data.points
        : Array.isArray(data.history)
          ? data.history
          : []

  const formattedPoints = rawPoints.map((pt) => {
    const rawVal = pt.value !== undefined ? pt.value : pt.rawValue
    const num = rawVal !== null && rawVal !== undefined && rawVal !== '' ? Number(rawVal) : null
    const valid = Number.isFinite(num)
    const timestamp = pt.timestamp || pt.time || pt.date || new Date().toISOString()
    const tsDate = new Date(timestamp)

    return {
      timestamp,
      formattedTime: formatTimestamp(timestamp),
      displayLabel:
        range === '7d'
          ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(tsDate)
          : new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(tsDate),
      value: valid ? num : null,
      rawValue: rawVal,
      valid,
      evaluation: evaluateSensorStatus(valid ? num : null, parameter),
    }
  })

  const sortedPoints = sortChronologically(formattedPoints)
  const stats = data.stats || calculateDatasetStats(sortedPoints, meta.decimals)

  return {
    ...data,
    isMock: false,
    source: 'live_api',
    parameter,
    parameterMeta: meta,
    range,
    dataPoints: sortedPoints,
    stats,
  }
}

/**
 * Live API Adapter
 * Connects to the smartImpact backend proxy using apiClient.
 *
 * NOTE (AGENT.md rule):
 * These backend endpoints are proposed contracts. This adapter does NOT assume
 * they already exist. If calls fail, it returns an explicit ApiError explaining
 * that the backend service is currently unreachable.
 */
export const liveApiAdapter = {
  name: 'live_api',
  isMock: false,

  /**
   * Fetch latest telemetry from proposed backend endpoint:
   * GET /api/telemetry/latest
   *
   * @param {string} [_scenario] - Unused in live mode
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async getLatestTelemetry(_scenario, options = {}) {
    try {
      const data = await apiClient.get(API_CONFIG.endpoints.latestTelemetry, {
        signal: options.signal,
      })

      if (!data || typeof data !== 'object') {
        throw new ApiError('Format payload telemetri dari backend tidak valid.', {
          type: 'parser',
          endpoint: API_CONFIG.endpoints.latestTelemetry,
        })
      }

      return {
        ...data,
        source: 'live_api',
        isMock: false,
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err
      }
      throw new ApiError(`Koneksi live backend gagal: ${err.message}`, {
        type: 'network',
        endpoint: API_CONFIG.endpoints.latestTelemetry,
        details: err,
      })
    }
  },

  /**
   * Fetch historical series from proposed backend endpoint:
   * GET /api/telemetry/history?parameter={parameter}&range={range}
   *
   * @param {{ parameter?: string, range?: string }} query
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async getHistory(query = {}, options = {}) {
    const { parameter = 'temperature', range = '24h' } = query
    const searchParams = new URLSearchParams({ parameter, range })
    const endpoint = `${API_CONFIG.endpoints.history}?${searchParams.toString()}`

    try {
      const data = await apiClient.get(endpoint, {
        signal: options.signal,
      })

      if (!data || typeof data !== 'object') {
        throw new ApiError('Format payload histori dari backend tidak valid.', {
          type: 'parser',
          endpoint,
        })
      }

      return normalizeHistoryPayload(data, parameter, range)
    } catch (err) {
      if (err instanceof ApiError) {
        throw err
      }
      throw new ApiError(`Gagal mengambil data histori dari backend: ${err.message}`, {
        type: 'network',
        endpoint,
        details: err,
      })
    }
  },

  /**
   * Fetch device connectivity status from proposed backend endpoint:
   * GET /api/device/status
   */
  async getDeviceStatus(options = {}) {
    return apiClient.get(API_CONFIG.endpoints.deviceStatus, {
      signal: options.signal,
    })
  },
}

export default liveApiAdapter
