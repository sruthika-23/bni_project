import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation, Link } from 'react-router-dom'
import { useDB, me } from './store'
import Icon from './icons'
import { Toaster } from './toast'
import { Palette, Notifications, UserMenu } from './Chrome'
import Login from './pages/Login'
import Teams from './pages/Teams'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Goals from './pages/Goals'
import Opportunities from './pages/Opportunities'
import Connects from './pages/Connects'
import Referrals from './pages/Referrals'
import Activity from './pages/Activity'
import Attendance from './pages/Attendance'
import Minutes from './pages/Minutes'
import Performance from './pages/Performance'
import { Members, Profile, OneToOnes, Business, Reports, Settings } from './pages/Modules'

const ROLE = { sa: 'Super Admin', th: 'Power Team Head', mb: 'Member' }
// To rename a sidebar item, change only its label here.
const NAV = [
  { group: 'MAIN MENU', items: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/members', icon: 'users', label: 'Members' },
    { to: '/teams', icon: 'network', label: 'Power Teams' },
    { to: '/goals', icon: 'target', label: 'Member Goals' },
    { to: '/notes', icon: 'heart', label: 'Thank-you Notes' },
  ] },
  { group: 'TEAM TRACKING', items: [
    { to: '/opportunities', icon: 'bulb', label: 'Opportunities' },
    { to: '/connects', icon: 'link', label: 'Specific Connects' },
    { to: '/referrals', icon: 'swap', label: 'Referrals' },
    { to: '/one-to-ones', icon: 'user', label: '1-to-1 Meetings' },
    { to: '/activity', icon: 'activity', label: 'Activity Tracker' },
    { to: '/joint-calls', icon: 'phone', label: 'Joint Calls' },
  ] },
  { group: 'MEETINGS & REPORTS', items: [
    { to: '/attendance', icon: 'calcheck', label: 'Attendance' },
    { to: '/minutes', icon: 'file', label: 'Minutes of Meeting' },
    { to: '/business', icon: 'trend', label: 'Business Generated' },
    { to: '/performance', icon: 'gauge', label: 'Performance' },
    { to: '/reports', icon: 'chart', label: 'Reports' },
    { to: '/settings', icon: 'sliders', label: 'Settings' },
  ] },
]
function Shell({ u }) {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false), [pal, setPal] = useState(false)
  useEffect(() => { setNavOpen(false) }, [location.pathname])
  useEffect(() => {
    const k = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal(p => !p) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  const nav = NAV
  return <div className="app-shell">
    <header className="topbar">
      <button type="button" className="tb-btn tb-menu" aria-label="Open menu" onClick={() => setNavOpen(true)}><Icon name="menu" size={20} /></button>
      <Link to="/dashboard" className="brand"><span className="brand-bni">BNI<span>.</span></span><span className="brand-divider"/><span className="brand-sub">Power Team Hub<small>Members Association</small></span></Link>
      <div className="top-actions">
        <button type="button" className="search-trigger" onClick={() => setPal(true)} aria-label="Search"><Icon name="search" size={17} /><span>Search members, teams, referrals…</span><kbd>Ctrl K</kbd></button>
        <Notifications />
        <UserMenu u={u} role={ROLE[u.role]} />
      </div>
    </header>
    {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
    <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
      <button type="button" className="drawer-x" aria-label="Close menu" onClick={() => setNavOpen(false)}><Icon name="x" size={18} /></button>
      {nav.map((g, i) => <div key={g.group} className="side-group"><div className={`side-label ${i ? 'side-label-spaced' : ''}`}>{g.group}</div>
        {g.items.map(n => <NavLink key={n.to} to={n.to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><span className="side-icon"><Icon name={n.icon} size={18} /></span>{n.label}</NavLink>)}</div>)}
      <div className="side-promo"><b>BNI.</b><strong>Grow Together</strong><p>Building stronger business relationships, one connection at a time.</p><span>CHANGING THE WAY THE WORLD DOES BUSINESS®</span></div><div className="sidebar-foot">© BNI Members Hub</div>
    </aside>
    <Palette open={pal} onClose={() => setPal(false)} nav={nav} />
    <main className="workspace"><Routes>
      <Route path="/joint-calls" element={<Activity key="jc" only="Joint call"/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/><Route path="/members" element={<Members/>}/><Route path="/members/:id" element={<Profile/>}/><Route path="/teams" element={<Teams/>}/>
      <Route path="/goals" element={<Goals/>}/><Route path="/opportunities" element={<Opportunities/>}/><Route path="/connects" element={<Connects/>}/><Route path="/referrals" element={<Referrals/>}/>
      <Route path="/one-to-ones" element={<OneToOnes/>}/><Route path="/activity" element={<Activity key="all"/>}/><Route path="/attendance" element={<Attendance/>}/><Route path="/minutes" element={<Minutes/>}/>
      <Route path="/business" element={<Business/>}/><Route path="/performance" element={<Performance/>}/><Route path="/reports" element={<Reports/>}/><Route path="/settings" element={<Settings/>}/><Route path="/notes" element={<Notes/>}/>
      <Route path="/clients" element={<Navigate to="/opportunities" replace/>}/><Route path="/meetings" element={<Navigate to="/attendance" replace/>}/>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes></main>
  </div>
}
export default function App() { useDB(); const u = me(); return <><HashRouter>{u ? <Shell u={u}/> : <Login/>}</HashRouter><Toaster/></> }
