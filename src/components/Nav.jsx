import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Home, LineChart, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import BrandMark from './BrandMark'

const navItems = [
  ['/', 'Home', Home],
  ['/blogs', 'Blogs', BookOpen],
  ['/trades', 'Trade Notes', LineChart],
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem('market-mind-theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('market-mind-theme', theme)
  }, [theme])

  function closeMenu() {
    setIsOpen(false)
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/" onClick={closeMenu}>
        <span><BrandMark /></span>
        Market & Mind
      </Link>
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
      <div className="nav-controls">
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
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
      </div>
    </header>
  )
}
