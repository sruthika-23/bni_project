import Icon from '../icons'
import { toastOk } from '../toast'
import Select from '../Select'
import { useState, useRef } from 'react'
import { useDB, me, TEAMS, headOf, teamUsers, teamStats, register, fm } from '../store'
import { PageHead, Table, Tiles, Pill } from '../ui'

const EMPTY = { name: '', email: '', pw: '', cat: '', team: '' }
const ROLE = { sa: 'Super Admin', th: 'Team Head', mb: 'Member' }

// Compact card for the Super Admin overview. Collapsed by default; the body stays small.
function TeamCard({ t, open, onToggle, onRegisterHead, onView }) {
  const head = headOf(t), s = teamStats(t)
  return (
    <article className={`tcard ${open ? 'is-open' : ''}`}>
      <button type="button" className="tcard-head" onClick={onToggle} aria-expanded={open}>
        <span className="tcard-no">{t}</span>
        <span className="tcard-title"><b>{TEAMS[t - 1]}</b><small>{s.members} {s.members === 1 ? 'member' : 'members'}</small></span>
        <span className={`dot ${head ? 'ok' : 'wait'}`} title={head ? 'Head registered' : 'Head pending'} />
        <span className="tcard-chev" aria-hidden="true"><Icon name="chevron" size={18} stroke={2.4} /></span>
      </button>
      <div className="collapse" data-open={open}>
        <div className="collapse-inner">
          <div className="tcard-body">
            <div className="tcard-stats">
              <div><b>{s.refs}</b><span>Referrals</span></div>
              <div><b>{s.joint}</b><span>Joint calls</span></div>
              <div><b>{fm(s.business)}</b><span>Business</span></div>
            </div>
            <div className="tcard-actions">
              {!head && <button type="button" className="btn-s" onClick={() => onRegisterHead(t)}><Icon name="plus" size={15} stroke={2.6} /> Register head</button>}
              <button type="button" className="btn-s" onClick={() => onView(t)}>View people</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Teams() {
  const db = useDB(), u = me(), isSA = u.role === 'sa', canReg = u.role !== 'mb'
  const [f, setF] = useState(EMPTY), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const [formOpen, setFormOpen] = useState(false), [open, setOpen] = useState(() => new Set()), [filter, setFilter] = useState('all')
  const formRef = useRef(null), listRef = useRef(null)
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setErr(''); setOk('') }
  const reset = () => { setF(EMPTY); setErr(''); setOk('') }
  const submit = e => { e.preventDefault(); const r = register(f); setErr(r); setOk(r ? '' : toastOk(`${f.name.trim()} registered successfully.`)); if (!r) setF(EMPTY) }
  const toggle = t => setOpen(s => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n })
  const goto = (ref) => setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  const registerHead = t => { setF({ ...EMPTY, team: String(t) }); setFormOpen(true); setOk(''); setErr(''); goto(formRef) }
  const viewPeople = t => { setFilter(String(t)); goto(listRef) }

  const pending = TEAMS.filter((_, i) => !headOf(i + 1)).length
  const people = (isSA ? db.users.filter(x => x.role !== 'sa') : teamUsers(u.team))
    .filter(x => !isSA || filter === 'all' || x.team === +filter)
    .sort((a, b) => a.team - b.team || (a.role === 'th' ? -1 : 1) - (b.role === 'th' ? -1 : 1) || a.name.localeCompare(b.name))
  const s = !isSA && teamStats(u.team)

  return (
    <>
      <PageHead eyebrow="TEAM STRUCTURE" title="Power Teams"
        sub={isSA ? `${12 - pending} of 12 teams have a head. Register the remaining heads; each head registers their own members.` : TEAMS[u.team - 1]}
        action={canReg && <button type="button" className="btn" aria-expanded={formOpen} onClick={() => setFormOpen(o => !o)}>{formOpen ? <><Icon name="minus" size={15} stroke={2.6} /> Close form</> : <><Icon name="plus" size={15} stroke={2.6} /> Register {isSA ? 'Team Head' : 'Member'}</>}</button>} />

      {canReg && (
        <div className="collapse reg-collapse" data-open={formOpen} ref={formRef}>
          <div className="collapse-inner">
            <form onSubmit={submit} className="card reg-form" autoComplete="off">
              <div className="form-head"><span className="form-head-icon">{isSA ? '♙' : '♧'}</span><div><h3>{isSA ? 'New Team Head' : 'New Member'}</h3><p>{isSA ? 'Create a login for a Power Team head. They will register their own members.' : 'Add a member to your Power Team with a temporary password.'}</p></div><span className="form-step">Registration</span></div>
              <div className="reg-grid">
                <div><label className="lbl">Full name *</label><input className="inp" value={f.name} onChange={set('name')} placeholder="e.g. Ramya Murugan" /></div>
                <div><label className="lbl">Email *</label><input className="inp" type="email" value={f.email} onChange={set('email')} placeholder="name@company.com" /></div>
                <div><label className="lbl">Temporary password *</label><input className="inp" type="password" value={f.pw} onChange={set('pw')} placeholder="Minimum 6 characters" autoComplete="new-password" /></div>
                <div><label className="lbl">Business category</label><input className="inp" value={f.cat} onChange={set('cat')} placeholder="e.g. HR Recruitment" /></div>
                {isSA && <div><label className="lbl">Power team *</label>
                  <Select className="inp" value={f.team} onChange={set('team')}><option value="">Choose a team without a head</option>
                    {TEAMS.map((n, i) => !headOf(i + 1) && <option key={n} value={i + 1}>{i + 1} · {n}</option>)}</Select></div>}
              </div>
              <div className="reg-actions">
                <span className="reg-msg">{err && <span className="text-bni">⚠ {err}</span>}{ok && <span className="text-green-700">✓ {ok}</span>}</span>
                <button type="button" className="btn-s" onClick={reset}>Reset</button>
                <button type="submit" className="btn">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSA ? <>
        <div className="section-bar"><h2>Teams overview</h2>
          <span className="legend-inline"><i className="dot ok" /> Head registered <i className="dot wait" /> Head pending</span></div>
        <div className="tcard-grid">{TEAMS.map((_, i) => <TeamCard key={i} t={i + 1} open={open.has(i + 1)} onToggle={() => toggle(i + 1)} onRegisterHead={registerHead} onView={viewPeople} />)}</div>
      </> : <Tiles items={[['Team members', s.members], ['Referrals', s.refs], ['Joint calls', s.joint], ['Business', fm(s.business)]]} />}

      <div className="section-bar" ref={listRef}><h2>{isSA ? 'Everyone in the chapter' : 'Team members'}</h2>
        {isSA && <Select className="inp filter-select" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All teams</option>{TEAMS.map((n, i) => <option key={n} value={i + 1}>{i + 1} · {n}</option>)}</Select>}
      </div>
      <Table head={isSA ? ['Name', 'Role', 'Power team', 'Category', 'Email'] : ['Name', 'Role', 'Category', 'Email']} rows={people.map(x => (
        <tr key={x.id}><td className="td font-semibold">{x.name}</td><td className="td"><Pill c={x.role === 'th' ? 'g' : 'n'}>{ROLE[x.role]}</Pill></td>
          {isSA && <td className="td">{TEAMS[x.team - 1]}</td>}<td className="td">{x.cat}</td><td className="td">{x.email}</td></tr>))} />
    </>
  )
}
