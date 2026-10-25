import { Calendar } from 'lucide-react'
import './TimeRangeSelector.css'

export default function TimeRangeSelector({ selectedRange, onSelectRange }) {
  const ranges = [
    { id: '1h', label: '1 Jam' },
    { id: '24h', label: '24 Jam' },
    { id: '7d', label: '7 Hari' },
  ]

  return (
    <div className="time-range-selector" role="group" aria-label="Pilih Rentang Waktu">
      <div className="time-range-selector__icon-wrap">
        <Calendar className="time-range-selector__icon" aria-hidden="true" />
      </div>

      <div className="time-range-selector__pill-group">
        {ranges.map((r) => {
          const isSelected = selectedRange === r.id
          return (
            <button
              key={r.id}
              type="button"
              className={`time-range-pill ${isSelected ? 'time-range-pill--active' : ''}`}
              onClick={() => onSelectRange(r.id)}
              aria-pressed={isSelected}
            >
              {r.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
