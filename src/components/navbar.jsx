import { useState } from 'react'
import Main from './main'
import Profile from './profile'
import Search from './search'
import Footer from './footer'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Navbar = ({ onLogout }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isProfile = location.pathname === '/profile'
  const userName = localStorage.getItem('cinema_user_name') || ''
  const userInitial = (userName.trim()[0] || 'A').toUpperCase()

  const goTo = (id) => {
    navigate('/browse')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  const logout = () => {
    localStorage.removeItem('cinema_token')
    localStorage.removeItem('cinema_user_name')
    if (onLogout) onLogout()
    else navigate('/', { replace: true })
  }

  return (
    <div className="browse-page">
      <header className="browse-nav">
        <Link className="brand" to="/browse">CINEMATCH</Link>
        <nav className="browse-links" aria-label="Primary navigation"><button className={!isProfile ? 'selected' : ''} onClick={() => goTo('home')}>Home</button><button onClick={() => goTo('shows')}>TV Shows</button><button onClick={() => goTo('movies')}>Movies</button><button onClick={() => goTo('latest')}>New & Popular</button><Link className={isProfile ? 'selected' : ''} to="/profile">My Profile</Link></nav>
        <div className="nav-actions"><button className="search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">⌕</button><button className="kids" onClick={() => goTo('shows')}>TV</button><button className="bell" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notifications">♢</button><button className="avatar" onClick={logout} aria-label="Log out" title="Log out">{userInitial}</button></div>
      </header>
      {searchOpen && <Search />}
      {notificationsOpen && <aside className="notification-panel">You’re all caught up — no new notifications.</aside>}
      {isProfile ? <Profile /> : <Main />}
      <Footer />
    </div>
  )
}

export default Navbar
