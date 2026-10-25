import { formatSensorValue } from '../utils/formatters.js'

/**
 * Calculates Min, Max, and Average safely from the exact dataset.
 * Complies with rule: "Min/maks/rata-rata hanya jika dapat dihitung dari dataset yang sama."
 *
 * @param {Array<{ value: number | null | undefined }>} dataPoints
 * @param {number} [decimals=1]
 * @returns {{
 *   min: number | null,
 *   max: number | null,
 *   avg: number | null,
 *   formattedMin: string,
 *   formattedMax: string,
 *   formattedAvg: string,
 *   count: number,
 *   hasInvalid: boolean
 * }}
 */
export function calculateDatasetStats(dataPoints, decimals = 1) {
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    return {
      min: null,
      max: null,
      avg: null,
      formattedMin: '--',
      formattedMax: '--',
      formattedAvg: '--',
      count: 0,
      hasInvalid: false,
    }
  }

  const validNumbers = []
  let hasInvalid = false

  for (const pt of dataPoints) {
    if (pt.value === null || pt.value === undefined || pt.value === '') {
      hasInvalid = true
      continue
    }
    const num = Number(pt.value)
    if (Number.isFinite(num)) {
      validNumbers.push(num)
    } else {
      hasInvalid = true
    }
  }

  if (validNumbers.length === 0) {
    return {
      min: null,
      max: null,
      avg: null,
      formattedMin: '--',
      formattedMax: '--',
      formattedAvg: '--',
      count: 0,
      hasInvalid,
    }
  }

  const min = Math.min(...validNumbers)
  const max = Math.max(...validNumbers)
  const sum = validNumbers.reduce((acc, curr) => acc + curr, 0)
  const avg = Number((sum / validNumbers.length).toFixed(decimals))

  return {
    min,
    max,
    avg,
    formattedMin: formatSensorValue(min, decimals),
    formattedMax: formatSensorValue(max, decimals),
    formattedAvg: formatSensorValue(avg, decimals),
    count: validNumbers.length,
    hasInvalid,
  }
}

/**
 * Sorts data points chronologically by timestamp ascending.
 * Resolves edge case: "timestamp tak berurutan".
 *
 * @param {Array<object>} points
 * @returns {Array<object>} Sorted points
 */
export function sortChronologically(points) {
  if (!Array.isArray(points)) return []
  return [...points].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return timeA - timeB
  })
}
