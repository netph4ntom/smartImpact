/**
 * csvExport.js
 * Utility to generate and download sanitized RFC 4180 CSV files with UTF-8 BOM.
 */

/**
 * Escape a single cell for standard CSV format.
 *
 * @param {any} cell
 * @returns {string}
 */
function escapeCsvCell(cell) {
  if (cell === null || cell === undefined) {
    return ''
  }
  const str = String(cell)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Triggers browser file download of CSV content with UTF-8 BOM.
 *
 * @param {string} filename - Output filename (e.g. 'telemetri-2026-10-25.csv')
 * @param {string[]} headers - Array of header titles
 * @param {Array<Array<any>>} rows - 2D array of data rows
 */
export function downloadCsv(filename, headers, rows) {
  const headerLine = headers.map(escapeCsvCell).join(',')
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','))
  const csvContent = [headerLine, ...bodyLines].join('\r\n')

  // \uFEFF is UTF-8 Byte Order Mark (BOM) so Microsoft Excel opens UTF-8 Indonesian accents cleanly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export full multi-parameter live telemetry series (Dashboard Overview Chart).
 *
 * @param {Array<object>} historyPoints
 * @param {string} [deviceName='ESP32']
 */
export function exportDashboardTelemetryCsv(historyPoints = [], deviceName = 'ESP32') {
  if (!Array.isArray(historyPoints) || historyPoints.length === 0) {
    alert('Belum ada data telemetri yang tersedia untuk diunduh.')
    return
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `smartimpact-telemetri-${deviceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dateStr}.csv`

  const headers = [
    'Waktu Pencatatan',
    'Jam',
    'Suhu Air (°C)',
    'Oksigen (mg/L)',
    'Amonia (mg/L)',
    'Salinitas (ppt)',
  ]

  const rows = historyPoints.map((pt) => {
    return [
      pt.timestamp || pt.fullTime || pt.time || '',
      pt.time || '',
      pt.temperature !== null && pt.temperature !== undefined ? pt.temperature : '',
      pt.ph !== null && pt.ph !== undefined ? pt.ph : '',
      pt.turbidity !== null && pt.turbidity !== undefined ? pt.turbidity : '',
      pt.tds !== null && pt.tds !== undefined ? pt.tds : '',
    ]
  })

  downloadCsv(filename, headers, rows)
}

/**
 * Export single parameter historical data points (History Page / Table).
 *
 * @param {object} parameterMeta - { id, name, unit }
 * @param {Array<object>} dataPoints - Array of normalized history points
 * @param {string} range - '1h' | '24h' | '7d'
 * @param {string} [deviceName='ESP32']
 */
export function exportHistoryParameterCsv(parameterMeta, dataPoints = [], range = '24h', deviceName = 'ESP32') {
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    alert('Belum ada data riwayat yang dapat diunduh.')
    return
  }

  const paramId = parameterMeta?.id || 'parameter'
  const paramName = parameterMeta?.name || 'Parameter'
  const unit = parameterMeta?.unit || ''
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `smartimpact-riwayat-${paramId}-${range}-${dateStr}.csv`

  const headers = [
    'Waktu Pencatatan',
    'Perangkat',
    'Parameter',
    `Nilai (${unit || 'skala'})`,
    'Satuan',
    'Status Baku Mutu',
    'Keterangan Evaluasi',
  ]

  const rows = dataPoints.map((pt) => {
    const evalData = pt.evaluation || {}
    return [
      pt.formattedTime || pt.timestamp || '',
      deviceName,
      paramName,
      pt.value !== null && pt.value !== undefined ? pt.value : 'Tidak Valid',
      unit,
      evalData.label || 'Tidak Diketahui',
      evalData.reason || '-',
    ]
  })

  downloadCsv(filename, headers, rows)
}
