import { NavLink } from 'react-router-dom'
import { LayoutDashboard, History, Settings } from 'lucide-react'
import './BottomNav.css'

export default function BottomNav() {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/riwayat',
      label: 'Riwayat',
      icon: History,
    },
    {
      to: '/pengaturan',
      label: 'Pengaturan',
      icon: Settings,
    },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navigasi Bawah">
      <div className="bottom-nav__inner">
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `bottom-nav__item touch-target ${isActive ? 'bottom-nav__item--active' : ''}`
              }
            >
              <IconComponent className="bottom-nav__icon" aria-hidden="true" />
              <span className="bottom-nav__label">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
