import { CheckCircle2, AlertTriangle, AlertCircle, WifiOff, HelpCircle, Activity } from 'lucide-react'
import './StatusBadge.css'

/**
 * StatusBadge Component
 * Displays a semantic status badge with both an icon and text label.
 * Complies with AGENT.md rule: "Color is never the sole indicator."
 *
 * @param {'normal' | 'warning' | 'danger' | 'offline' | 'unknown' | 'demo'} variant
 * @param {string} label - Optional custom text label
 * @param {'sm' | 'md'} size
 */
export default function StatusBadge({
  variant = 'normal',
  label,
  size = 'md',
  className = '',
}) {
  const configs = {
    normal: {
      defaultLabel: 'Normal',
      icon: CheckCircle2,
      styleClass: 'status-badge--normal',
    },
    warning: {
      defaultLabel: 'Perhatian',
      icon: AlertTriangle,
      styleClass: 'status-badge--warning',
    },
    danger: {
      defaultLabel: 'Kritis',
      icon: AlertCircle,
      styleClass: 'status-badge--danger',
    },
    offline: {
      defaultLabel: 'Offline',
      icon: WifiOff,
      styleClass: 'status-badge--offline',
    },
    unknown: {
      defaultLabel: 'Tidak Diketahui',
      icon: HelpCircle,
      styleClass: 'status-badge--unknown',
    },
    demo: {
      defaultLabel: 'Data Contoh',
      icon: Activity,
      styleClass: 'status-badge--demo',
    },
  }

  const config = configs[variant] || configs.unknown
  const IconComponent = config.icon
  const displayLabel = label || config.defaultLabel

  return (
    <span
      className={`status-badge ${config.styleClass} status-badge--${size} ${className}`}
      role="status"
    >
      <IconComponent className="status-badge__icon" aria-hidden="true" />
      <span className="status-badge__text">{displayLabel}</span>
    </span>
  )
}
