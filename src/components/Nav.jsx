import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Home, LineChart, UserRound } from 'lucide-react'
import BrandMark from './BrandMark'

const navItems = [
  ['/', 'Home', Home],
  ['/blogs', 'Blogs', BookOpen],
  ['/trades', 'Trade Notes', LineChart],
]

export default function Nav() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span><BrandMark /></span>
        Market & Mind
      </Link>
      <nav className="site-nav">
        {navItems.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={16} strokeWidth={2.4} />
            {label}
          </NavLink>
        ))}
        <a href="https://preetanurag.github.io/portfolio-2026/" target="_blank" rel="noreferrer">
          <UserRound size={16} strokeWidth={2.4} />
          About Me
        </a>
      </nav>
    </header>
  )
}
