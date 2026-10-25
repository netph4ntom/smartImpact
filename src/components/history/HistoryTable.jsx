import StatusBadge from '../common/StatusBadge'
import './HistoryTable.css'

export default function HistoryTable({
  dataPoints = [],
  parameterMeta,
}) {
  const unit = parameterMeta?.unit ? ` ${parameterMeta.unit}` : ''

  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    return null
  }

  // Reverse points so latest reading is displayed on top in the table
  const displayRows = [...dataPoints].reverse()

  return (
    <div className="history-table-section card" aria-labelledby="history-table-title">
      <div className="history-table-section__header">
        <h2 id="history-table-title" className="history-table-section__title">
          Daftar Pembacaan Terkini ({parameterMeta?.name})
        </h2>
        <span className="history-table-section__count">
          {displayRows.length} titik data
        </span>
      </div>

      <div className="history-table-container">
        <table className="history-data-table">
          <thead>
            <tr>
              <th scope="col">Waktu Pencatatan</th>
              <th scope="col">Pembacaan</th>
              <th scope="col">Status Baku Mutu</th>
              <th scope="col">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, idx) => {
              const isInvalid = !row.valid || row.value === null || !Number.isFinite(Number(row.value))
              const evaluation = row.evaluation || { status: 'unknown', label: 'Tidak Diketahui' }

              return (
                <tr key={idx} className={isInvalid ? 'history-data-table__row--invalid' : ''}>
                  <td className="history-data-table__time">
                    {row.formattedTime || row.timestamp}
                  </td>
                  <td className="history-data-table__value">
                    {isInvalid ? (
                      <span className="invalid-text">Tidak Valid</span>
                    ) : (
                      <strong>{row.value}{unit}</strong>
                    )}
                  </td>
                  <td>
                    <StatusBadge
                      variant={evaluation.status}
                      label={evaluation.label}
                      size="sm"
                    />
                  </td>
                  <td className="history-data-table__reason">
                    {evaluation.reason || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
