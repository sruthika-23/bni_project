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
import Opportunities from './pages/Opportunities'
import Connects from './pages/Connects'
import Referrals from './pages/Referrals'
import Activity from './pages/Activity'
import Attendance from './pages/Attendance'
import Minutes from './pages/Minutes'
import Performance from './pages/Performance'
import { Members, Profile, OneToOnes, Business, Reports, Settings } from './pages/Modules'
import FullReport from './FullReport'
import TopClients from './pages/TopClients'
import BusinessNetwork from './pages/BusinessNetwork'

const ROLE = { sa: 'Super Admin', th: 'Power Team Coordinator', mb: 'Member' }
// To rename a sidebar item, change only its label here.
const NAV = [
  { group: 'MAIN MENU', items: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/teams', icon: 'network', label: 'Power Teams' },
    { to: '/members', icon: 'users', label: 'Members' },
  ] },
  { group: 'TEAM TRACKING', items: [
    { to: '/opportunities', icon: 'bulb', label: 'Opportunities' },
    { to: '/activity', icon: 'activity', label: 'Activity Tracker' },
    { to: '/business-network', icon: 'network', label: 'Business Network' },
  ] },
  { group: 'MEETINGS & REPORTS', items: [
    { to: '/attendance', icon: 'calcheck', label: 'Attendance' },
    { to: '/minutes', icon: 'file', label: 'Minutes of Meeting' },
    { to: '/business', icon: 'trend', label: 'Business Generated' },
    { to: '/top-clients', icon: 'users', label: 'Top Clients', superAdminOnly: true },
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
  const nav = NAV.map(group => ({
    ...group,
    items: group.items.filter(item => !item.superAdminOnly || u.role === 'sa'),
  }))
  return <div className="app-shell">
    <header className="topbar">
      <button type="button" className="tb-btn tb-menu" aria-label="Open menu" onClick={() => setNavOpen(true)}><Icon name="menu" size={20} /></button>
      <Link to="/dashboard" className="brand"><span className="brand-knights">KNIGHTS</span><span className="brand-divider"/><span className="brand-sub">Power Team Hub<small>Members Association</small></span></Link>
      <div className="top-actions">
        <button type="button" className="search-trigger" onClick={() => setPal(true)} aria-label="Search"><Icon name="search" size={17} /><span>Search companies or modules…</span><kbd>Ctrl K</kbd></button>
        <Notifications />
        <UserMenu u={u} role={ROLE[u.role]} />
      </div>
    </header>
    {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
    <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
      <button type="button" className="drawer-x" aria-label="Close menu" onClick={() => setNavOpen(false)}><Icon name="x" size={18} /></button>
      {nav.map((g, i) => <div key={g.group} className="side-group"><div className={`side-label ${i ? 'side-label-spaced' : ''}`}>{g.group}</div>
        {g.items.map(n => <NavLink key={n.to} to={n.to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><span className="side-icon"><Icon name={n.icon} size={18} /></span>{n.label}</NavLink>)}</div>)}
      <div className="side-promo"><b>KNIGHTS</b><strong>Grow Together</strong><p>Building stronger business relationships, one connection at a time.</p><span>CHANGING THE WAY THE WORLD DOES BUSINESS®</span></div><div className="sidebar-foot">© Knights Members Hub</div>
    </aside>
    <Palette open={pal} onClose={() => setPal(false)} nav={nav} />
    <main className="workspace"><Routes>
      <Route path="/joint-calls" element={<Activity key="jc" only="Joint call"/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/><Route path="/members" element={<Members/>}/><Route path="/members/:id" element={<Profile/>}/><Route path="/teams" element={<Teams/>}/><Route path="/teams/:teamId" element={<Teams/>}/>
      <Route path="/goals" element={<Navigate to="/members?tab=goals" replace/>}/><Route path="/opportunities" element={<Opportunities/>}/><Route path="/connects" element={<Connects/>}/><Route path="/referrals" element={<Referrals/>}/>
      <Route path="/one-to-ones" element={<OneToOnes/>}/><Route path="/activity" element={<Activity key="all"/>}/><Route path="/attendance" element={<Attendance/>}/><Route path="/minutes" element={<Minutes/>}/>
      <Route path="/business" element={<Business/>}/><Route path="/top-clients" element={u.role === 'sa' ? <TopClients/> : <Navigate to="/dashboard" replace/>}/><Route path="/performance" element={<Performance/>}/><Route path="/reports" element={<Reports/>}/><Route path="/overall-report" element={<FullReport/>}/><Route path="/settings" element={<Settings/>}/><Route path="/notes" element={<Notes/>}/>
      <Route path="/business-network" element={<BusinessNetwork/>}/>
      <Route path="/clients" element={<Navigate to="/opportunities" replace/>}/><Route path="/meetings" element={<Navigate to="/attendance" replace/>}/>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes><footer className="app-credit">Designed and developed by <a href="https://digiworldsoftwaresolutions.com/" target="_blank" rel="noreferrer">Digiworld</a></footer></main>
  </div>
}
export default function App() { useDB(); const u = me(); return <><HashRouter>{u ? <Shell u={u}/> : <Login/>}</HashRouter><Toaster/></> }
