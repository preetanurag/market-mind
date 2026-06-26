import { Link, NavLink } from 'react-router-dom'

const navItems = [
  ['/', 'Home'],
  ['/posts', 'All Posts'],
  ['/blogs', 'Blogs'],
  ['/trades', 'Trade Notes'],
  ['/admin', 'Admin'],
]

export default function Nav() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span>PA</span>
        Trade Notes
      </Link>
      <nav className="site-nav">
        {navItems.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
