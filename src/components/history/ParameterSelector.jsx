import { Thermometer, Activity, Waves, Droplets } from 'lucide-react'
import './ParameterSelector.css'

export default function ParameterSelector({ selectedParameter, onSelectParameter }) {
  const parameters = [
    {
      id: 'temperature',
      label: 'Suhu Air',
      unit: '°C',
      icon: Thermometer,
    },
    {
      id: 'ph',
      label: 'pH',
      unit: '',
      icon: Activity,
    },
    {
      id: 'turbidity',
      label: 'Turbidity',
      unit: 'NTU',
      icon: Waves,
    },
    {
      id: 'tds',
      label: 'Salinitas',
      unit: 'ppt',
      icon: Droplets,
    },
  ]

  return (
    <div className="parameter-selector" role="tablist" aria-label="Pilih Parameter Kualitas Air">
      {parameters.map((param) => {
        const IconComp = param.icon
        const isSelected = selectedParameter === param.id

        return (
          <button
            key={param.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls="history-chart-panel"
            id={`tab-${param.id}`}
            className={`param-tab touch-target ${isSelected ? 'param-tab--active' : ''}`}
            onClick={() => onSelectParameter(param.id)}
          >
            <div className="param-tab__icon-wrap">
              <IconComp className="param-tab__icon" aria-hidden="true" />
            </div>
            <div className="param-tab__text">
              <span className="param-tab__label">{param.label}</span>
              {param.unit && <span className="param-tab__unit">({param.unit})</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
