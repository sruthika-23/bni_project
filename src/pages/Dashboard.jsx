import { Link, useNavigate } from 'react-router-dom'
import { useDB, me, TEAMS, teamUsers, headOf, teamStats, won, att, goalOf, pc, fm, dv, fridayWeek, fmtD } from '../store'
import { HBar, Columns, Donut, Line, Panel, Spark, CountUp } from '../charts'
import Icon from '../icons'

const Metric = ({ icon, label, value, note, spark, onClick }) => {
  const content = <>
    <div className="metric-icon red"><Icon name={icon} size={24} /></div>
    <div className="metric-copy"><span>{label}</span><strong><CountUp value={value} /></strong>{note && <small className="trend">{note}</small>}</div>
    {spark && spark.length > 2 && <Spark data={spark} className="metric-spark" />}
  </>
  return onClick
    ? <button type="button" className="metric-card metric-card-clickable" onClick={onClick}>{content}</button>
    : <div className="metric-card">{content}</div>
}
// Running total over time (last 8 points) for the small trend lines on metric cards.
const cum = (items, n = 8) => { let t = 0; return [...items].sort((a, b) => dv(a.d) - dv(b.d)).map(x => t += x.v).slice(-n) }
const Banner = ({ u }) => (
  <section className="welcome-banner">
    <div className="welcome-copy"><span className="eyebrow">{u.role === 'sa' ? 'CHAPTER OVERVIEW' : u.role === 'th' ? 'TEAM OVERVIEW' : 'MY OVERVIEW'}</span>
      <h1>{(h => h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')(new Date().getHours())}, {u.name.split(' ')[0]}</h1>
      <p>{u.role === 'sa' ? 'Every power team at a glance.' : u.role === 'th' ? 'How your team is performing.' : 'Your referrals, calls and goal progress.'}</p></div>
    <div className="banner-brand"><span>Changing the Way<br />the World Does Business<sup>®</sup></span></div>
  </section>
)
const Upcoming = ({ db, team }) => {
  const today = new Date().setHours(0, 0, 0, 0)
  const schedules = Object.entries(db.teamSchedules || {})
    .filter(([id]) => !team || +id === team)
    .map(([id, meeting]) => ({ ...meeting, team: +id }))
    .filter(meeting => meeting.d && dv(meeting.d) >= today)
    .sort((a, b) => dv(a.d) - dv(b.d))
    .slice(0, team ? 1 : 3)
  return <Panel title={team ? 'Next team meeting' : 'Upcoming team meetings'}>
    {schedules.length ? schedules.map(meeting => <div className="meeting-content" key={meeting.team}>
      <div className="date-tile"><b>{meeting.d.split('-')[0]}</b><span>{meeting.d.split('-')[1]}</span></div>
      <div><b><Link to={`/teams/${meeting.team}`}>{TEAMS[meeting.team - 1]}</Link></b><p>{meeting.t} · {meeting.venue}</p></div>
    </div>) : <div className="empty-state">
      No upcoming meeting scheduled. <Link className="muted-link" to={team ? `/teams/${team}` : '/teams'}>Schedule from Power Teams</Link>
    </div>}
  </Panel>
}

function NetworkReminder({ db, u }) {
  if (u.role === 'sa' || new Date().getDay() !== 5) return null
  const week = fridayWeek()
  const submitted = db.fridayEntries.some(entry => entry.member === u.id && entry.week === week)
  if (submitted) return null
  return <Link className="network-dashboard-reminder" to="/business-network">
    <Icon name="bell" size={18} />
    <span><b>Business Network reminder</b><small>Update your specific give and ask for {fmtD(week)}.</small></span>
    <Icon name="arrow" size={16} />
  </Link>
}

const short = d => d.split('-').slice(0, 2).join(' ')
const mix = (db, ids) => [
  { l: '1-to-1s', v: db.ones.filter(o => ids.includes(o.f)).length },
  { l: 'Referrals', v: db.refs.filter(r => ids.includes(r.f)).length },
  { l: 'Joint calls', v: db.acts.filter(a => a.t === 'Joint call' && ids.includes(a.f)).length },
  { l: 'Power dates', v: db.acts.filter(a => a.t === 'Power Date' && ids.includes(a.f)).length },
]
const trend = (db, ids) => db.meets.map(m => {
  const rec = ids.filter(i => i in m.s)
  return { l: short(m.d), v: rec.length ? Math.round(rec.filter(i => m.s[i] === 'P').length / rec.length * 100) : 0 }
})

function SuperAdmin({ db }) {
  const navigate = useNavigate()
  const all = db.users.filter(x => x.role !== 'sa'), ids = all.map(x => x.id)
  const T = TEAMS.map((n, i) => ({ n, t: i + 1, s: teamStats(i + 1), head: headOf(i + 1) }))
  const business = T.reduce((a, x) => a + x.s.business, 0), heads = T.filter(x => x.head).length
  const metrics = {
    business: { label: 'Overall business', icon: 'rupee', value: business, format: fm },
    ones: { label: '1-to-1 meetings', icon: 'user', value: db.ones.filter(o => ids.includes(o.f)).length },
    referrals: { label: 'Referrals passed', icon: 'swap', value: db.refs.filter(r => ids.includes(r.f)).length },
    joint: { label: 'Joint calls', icon: 'phone', value: db.acts.filter(a => a.t === 'Joint call' && ids.includes(a.f)).length },
  }
  return <>
    <div className="metrics-grid">
      {Object.entries(metrics).map(([key, metric]) => <Metric key={key} icon={metric.icon} label={metric.label}
        value={metric.format ? metric.format(metric.value) : metric.value} onClick={() => navigate(`/teams?metric=${key}`)} />)}
    </div>
    <div className="chart-grid c21">
      <Columns title="Referrals and joint calls by team" hint="Team numbers as on Power Teams" series={['Referrals', 'Joint calls']} groups={T.map(x => ({ l: String(x.t), v: [x.s.refs, x.s.joint] }))} />
      <Donut title="Activity mix" data={mix(db, ids)} />
    </div>
    <div className="chart-grid c2">
      <HBar title="Business generated by team" data={T.map(x => ({ l: `${x.t} · ${x.n}`, v: x.s.business }))} fmt={fm} share />
      <Line title="Attendance by meeting" hint="% present" points={trend(db, ids)} fmt={v => `${v}%`} max={100} />
    </div>
    <div className="chart-grid c2">
      <Donut title="Coordinator registration" centre={`${heads}/12`} data={[{ l: 'Registered', v: heads }, { l: 'Pending', v: 12 - heads }]} />
      <Upcoming db={db} />
    </div>
  </>
}

function Head({ db, u }) {
  const us = teamUsers(u.team), ids = us.map(x => x.id), s = teamStats(u.team)
  const first = x => x.name.split(' ')[0]
  const row = x => [db.refs.filter(r => r.f === x.id).length, db.acts.filter(a => a.t === 'Joint call' && a.f === x.id).length, db.ones.filter(o => o.f === x.id).length]
  return <>
    <div className="metrics-grid team-metrics-grid">
      <Metric icon="users" label="Team members" value={us.length} />
      <Metric icon="swap" label="Referrals passed" value={s.refs} spark={cum(db.refs.filter(r => ids.includes(r.f)).map(r => ({ d: r.d, v: 1 })))} />
      <Metric icon="rupee" label="Business generated" value={fm(s.business)} note={`${pc(s.business, s.goal).toFixed(0)}% of goal`} spark={cum(db.notes.filter(n => n.st === 2 && ids.includes(n.g)).map(n => ({ d: n.d, v: n.v })))} />
      <Metric icon="calcheck" label="Average attendance" value={`${Math.round(s.att)}%`} />
      <Metric icon="user" label="1-to-1 meetings" value={s.ones} />
      <Metric icon="phone" label="Joint calls" value={s.joint} />
    </div>
    <div className="chart-grid c21">
      <Columns title="Activity by member" hint="Referrals, joint calls, 1-to-1s" series={['Referrals', 'Joint calls', '1-to-1s']} groups={us.map(x => ({ l: first(x), v: row(x) }))} />
      <Donut title="Activity mix" data={mix(db, ids)} />
    </div>
    <div className="chart-grid c2">
      <Line title="Attendance by meeting" hint="% present" points={trend(db, ids)} fmt={v => `${v}%`} max={100} />
      <Upcoming db={db} team={u.team} />
    </div>
  </>
}

function Member({ db, u }) {
  const a = att(u.id), goal = goalOf(u), b = won(u.id)
  const given = db.refs.filter(r => r.f === u.id).length, got = db.refs.filter(r => r.to === u.id).length
  const joint = db.acts.filter(x => x.t === 'Joint call' && (x.f === u.id || x.to === u.id)).length
  const ones = db.ones.filter(o => o.f === u.id || o.to === u.id).length
  return <>
    <div className="metrics-grid team-metrics-grid">
      <Metric icon="target" label="Power Team goal" value={u.bni ? fm(goal) : 'Not set'} />
      <Metric icon="rupee" label="Business converted" value={fm(b)} />
      <Metric icon="swap" label="Referrals passed" value={given} />
      <Metric icon="calcheck" label="Attendance" value={a === null ? '—' : `${Math.round(a)}%`} />
      <Metric icon="user" label="1-to-1 meetings" value={ones} />
      <Metric icon="phone" label="Joint calls" value={joint} />
    </div>
    <div className="chart-grid c2">
      <Donut title="My activity" data={[{ l: 'Referrals passed', v: given }, { l: 'Referrals received', v: got }, { l: 'Joint calls', v: joint }]} />
      <HBar title="Goal progress" hint="₹" data={[{ l: 'Business converted', v: b }, { l: 'Power Team goal', v: goal }]} fmt={fm} />
    </div>
    <div className="chart-grid c2">
      <Line title="My attendance" hint="Present = 100%" points={db.meets.filter(m => u.id in m.s).map(m => ({ l: short(m.d), v: m.s[u.id] === 'P' ? 100 : 0 }))} fmt={v => `${v}%`} max={100} />
      <Panel title="Quick actions">
        <Link className="quick-action" to="/referrals"><Icon name="plus" size={15} stroke={2.6} /> Pass a referral</Link>
        <Link className="quick-action" to="/joint-calls"><Icon name="plus" size={15} stroke={2.6} /> Log a joint call</Link>
      </Panel>
    </div>
  </>
}

export default function Dashboard() {
  const db = useDB(), u = me()
  return <div className="dashboard-page"><div className="welcome-row"><Banner u={u} /></div>
    <NetworkReminder db={db} u={u} />
    {u.role === 'sa' ? <SuperAdmin db={db} /> : u.role === 'th' ? <Head db={db} u={u} /> : <Member db={db} u={u} />}</div>
}
