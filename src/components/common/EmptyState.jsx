import { Inbox } from 'lucide-react'
import './EmptyState.css'

/**
 * EmptyState Component
 * Displays a friendly empty state when no historical or telemetry data is available.
 *
 * @param {string} title
 * @param {string} message
 * @param {React.ReactNode} action
 * @param {React.ElementType} icon
 */
export default function EmptyState({
  title = 'Belum Ada Data Tersedia',
  message = 'Data telemetri akan muncul secara otomatis ketika perangkat ESP32 mulai mengirimkan pembacaan.',
  action,
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__icon-wrap">
        <Icon className="empty-state__icon" aria-hidden="true" />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
