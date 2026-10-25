import './PageHeader.css'

/**
 * PageHeader Component
 * Consistent header banner across Dashboard, Riwayat, and Pengaturan pages.
 *
 * @param {string} title
 * @param {string} subtitle
 * @param {React.ReactNode} actions - Optional right-side controls or badges
 */
export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <header className={`page-header ${className}`}>
      <div className="page-header__main">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}
