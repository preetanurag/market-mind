import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Home, LineChart, Menu, UserRound, X } from 'lucide-react'
import BrandMark from './BrandMark'

const navItems = [
  ['/', 'Home', Home],
  ['/blogs', 'Blogs', BookOpen],
  ['/trades', 'Trade Notes', LineChart],
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/" onClick={closeMenu}>
        <span><BrandMark /></span>
        Market & Mind
      </Link>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-nav"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X size={17} /> : <Menu size={17} />}
        Menu
      </button>
      <nav className={`site-nav ${isOpen ? 'open' : ''}`} id="site-nav" aria-label="Primary navigation">
        {navItems.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} onClick={closeMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={16} strokeWidth={2.4} />
            {label}
          </NavLink>
        ))}
        <a href="https://preetanurag.github.io/portfolio-2026/" target="_blank" rel="noreferrer" onClick={closeMenu}>
          <UserRound size={16} strokeWidth={2.4} />
          About Me
        </a>
      </nav>
    </header>
  )
}
