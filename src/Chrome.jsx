import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB, me, U, TEAMS, scope, dv, logout } from './store'
import Icon from './icons'

function useOutside(open, close) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const d = e => { if (ref.current && !ref.current.contains(e.target)) close() }
    const k = e => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', d); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', d); document.removeEventListener('keydown', k) }
  }, [open])
  return ref
}

/* ---------- Command palette (Ctrl/Cmd + K) ---------- */
export function Palette({ open, onClose, nav }) {
  const db = useDB(), u = me(), go = useNavigate()
  const [q, setQ] = useState(''), [hi, setHi] = useState(0)
  const inp = useRef(null), list = useRef(null)
  useEffect(() => { if (open) { setQ(''); setHi(0); setTimeout(() => inp.current?.focus(), 30) } }, [open])
  const s = q.trim().toLowerCase(), has = x => !s || x.toLowerCase().includes(s)
  const pages = nav.flatMap(g => g.items).filter(n => has(n.label)).map(n => ({ g: 'Pages', icon: n.icon, t: n.label, sub: 'Go to page', to: n.to }))
  const people = scope(u).filter(p => has(`${p.name} ${p.cat || ''}`)).slice(0, s ? 6 : 4)
    .map(p => ({ g: 'Members', icon: 'user', t: p.name, sub: `${p.cat || 'Member'} · ${TEAMS[p.team - 1] || ''}`, to: `/members/${p.id}` }))
  const teams = u.role === 'sa' ? TEAMS.map((n, i) => ({ n, i })).filter(x => s && has(x.n)).slice(0, 4).map(x => ({ g: 'Power Teams', icon: 'network', t: x.n, sub: `Team ${x.i + 1}`, to: '/teams' })) : []
  const refs = s ? db.refs.filter(r => (u.role === 'sa' || U(r.f)?.team === u.team || U(r.to)?.team === u.team) && has(`${r.co} ${r.cn || ''}`)).slice(0, 4)
    .map(r => ({ g: 'Referrals', icon: 'swap', t: r.co, sub: `${U(r.f)?.name} → ${U(r.to)?.name}`, to: '/referrals' })) : []
  const items = [...(s ? [...people, ...teams, ...refs, ...pages] : [...pages.slice(0, 6), ...people])]
  useEffect(() => { setHi(0) }, [q])
  useEffect(() => { list.current?.querySelector(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' }) }, [hi])
  if (!open) return null
  const pick = it => { if (it) { onClose(); go(it.to) } }
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(i => Math.min(items.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(i => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); pick(items[hi]) }
    else if (e.key === 'Escape') onClose()
  }
  let last = ''
  return <div className="pal-scrim" onMouseDown={onClose}>
    <div className="pal" role="dialog" aria-label="Search" onMouseDown={e => e.stopPropagation()} onKeyDown={key}>
      <div className="pal-input"><Icon name="search" size={19} /><input ref={inp} value={q} onChange={e => setQ(e.target.value)} placeholder="Search members, teams, referrals or pages…" /><kbd>Esc</kbd></div>
      <div className="pal-list" ref={list}>
        {items.length ? items.map((it, i) => {
          const head = it.g !== last; last = it.g
          return <div key={it.g + it.t + i}>
            {head && <div className="pal-group">{it.g}</div>}
            <div data-i={i} className={`pal-item ${i === hi ? 'is-hi' : ''}`} onMouseEnter={() => setHi(i)} onClick={() => pick(it)}>
              <span className="pal-ico"><Icon name={it.icon} size={17} /></span>
              <span className="pal-txt"><b>{it.t}</b><small>{it.sub}</small></span>
              {i === hi && <Icon name="enter" size={15} className="pal-enter" />}
            </div></div>
        }) : <div className="pal-empty"><Icon name="search" size={26} /><b>No results for “{q}”</b><span>Try a member name, company or page.</span></div>}
      </div>
      <div className="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
    </div>
  </div>
}

/* ---------- Notifications ---------- */
export function Notifications() {
  const db = useDB(), u = me(), go = useNavigate()
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(() => { try { return +localStorage.getItem('bni-seen-' + u.id) || 0 } catch { return 0 } })
  const ref = useOutside(open, () => setOpen(false))
  const mine = db.refs.filter(r => u.role === 'sa' || U(r.to)?.id === u.id || (u.role === 'th' && U(r.to)?.team === u.team))
    .sort((a, b) => dv(b.d) - dv(a.d))
  const unread = Math.max(0, mine.length - seen)
  const markRead = () => { setSeen(mine.length); try { localStorage.setItem('bni-seen-' + u.id, String(mine.length)) } catch { /* ignore */ } }
  return <div className="menu-wrap" ref={ref}>
    <button type="button" className="tb-btn" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen(o => !o)}>
      <Icon name="bell" size={18} />{unread > 0 && <i className="tb-badge">{unread > 9 ? '9+' : unread}</i>}
    </button>
    {open && <div className="pop pop-notif">
      <div className="pop-head"><b>Notifications</b>{unread > 0 && <button type="button" onClick={markRead}>Mark all read</button>}</div>
      <div className="pop-body">
        {mine.slice(0, 6).map((r, i) => <button type="button" key={i} className={`notif ${i < unread ? 'is-new' : ''}`} onClick={() => { setOpen(false); go('/referrals') }}>
          <span className="notif-ico"><Icon name="swap" size={16} /></span>
          <span className="notif-txt"><b>{U(r.f)?.name} → {U(r.to)?.name}</b><small>{r.co} · {r.d}</small></span>
          {i < unread && <i className="notif-dot" />}
        </button>)}
        {!mine.length && <div className="pop-empty"><Icon name="inbox" size={26} /><span>You’re all caught up.</span></div>}
      </div>
      <button type="button" className="pop-foot" onClick={() => { setOpen(false); go('/referrals') }}>View all referrals <Icon name="arrow" size={14} /></button>
    </div>}
  </div>
}

/* ---------- User menu ---------- */
export function UserMenu({ u, role }) {
  const [open, setOpen] = useState(false)
  const ref = useOutside(open, () => setOpen(false))
  const initials = u.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
  return <div className="menu-wrap" ref={ref}>
    <button type="button" className="user-menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
      <span className="avatar">{initials}</span><span className="um-name"><b>{u.name}</b><small>{role}</small></span>
      <Icon name="chevron" size={15} className={`um-chev ${open ? 'is-open' : ''}`} />
    </button>
    {open && <div className="pop pop-user">
      <div className="pop-id"><span className="avatar lg">{initials}</span><div><b>{u.name}</b><small>{u.email}</small><em>{role}</em></div></div>
      <button type="button" className="pop-row danger" onClick={logout}><Icon name="logout" size={17} /><span>Log out</span></button>
    </div>}
  </div>
}
