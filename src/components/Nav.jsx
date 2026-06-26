import { Link, NavLink } from 'react-router-dom'

const navItems = [
  ['/', 'Home'],
  ['/blogs', 'Blogs'],
  ['/trades', 'Trades'],
  ['/admin', 'Admin'],
]

export default function Nav() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span>PA</span>
        Preet Anurag
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
