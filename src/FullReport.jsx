import { Link } from 'react-router-dom'
import Icon from './icons'
import { useDB, me, U, scope, TEAMS, dv, fm } from './store'
import { PageHead } from './ui'

const T = ({ title, head, rows }) => <section className="fr-sec">
  <h3>{title}</h3>
  <table className="fr-tbl"><thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.length ? rows : <tr><td colSpan={head.length}>No records</td></tr>}</tbody></table>
</section>

const attendanceLabel = status => ({ P: 'Present', A: 'Absent', E: 'Excused' }[status] || '—')

export default function FullReport() {
  const db = useDB(), u = me(), people = scope(u), ids = people.map(p => p.id)
  const byDate = (a, b) => dv(a.d) - dv(b.d)
  const nm = id => U(id)?.name || '—'
  const meets = [...db.meets].sort(byDate)
  const notes = db.notes.filter(n => ids.includes(n.g) || ids.includes(n.to)).sort(byDate)
  const wonNotes = notes.filter(n => n.st === 2)
  const total = wonNotes.reduce((sum, n) => sum + (+n.v || 0), 0)
  const refs = db.refs.filter(r => ids.includes(r.f)).sort(byDate)
  const ones = db.ones.filter(o => ids.includes(o.f) || ids.includes(o.to)).sort(byDate)
  const opps = db.opps.filter(o => ids.includes(o.m)).sort(byDate)
  const cons = db.connects.filter(c => ids.includes(c.f)).sort(byDate)
  const acts = db.acts.filter(a => ids.includes(a.f) || ids.includes(a.to)).sort(byDate)
  const moms = db.moms.filter(m => u.role === 'sa' || m.team === u.team).sort((a, b) => a.no - b.no)
  const networkEntries = db.fridayEntries.filter(entry => ids.includes(entry.member)).sort((a, b) => b.week.localeCompare(a.week) || a.sno - b.sno)
  const schedules = Object.entries(db.teamSchedules || {}).filter(([team]) => u.role === 'sa' || +team === u.team)
    .map(([team, schedule]) => ({ team: +team, ...schedule }))

  return <div className="fr">
    <PageHead eyebrow="REPORTS" title="Overall Report" sub="A printable summary of attendance, business, referrals, member connections and meeting updates."
      action={<div className="flex items-center gap-2 fr-noprint">
        <Link className="btn-s" to="/reports">Back to Reports</Link>
        <button type="button" className="btn" onClick={() => window.print()}><Icon name="file" size={15} /> Download PDF</button>
      </div>} />
    <div className="fr-title">Knights Power Team – Overall Report <small>Generated {new Date().toLocaleDateString('en-GB')}</small></div>
    <p className="fr-hint fr-noprint">In the print dialog, choose “Save as PDF” to download this report.</p>

    <T title="1. Meeting-wise attendance" head={['Meeting date', ...people.map(p => p.name), 'Present', 'Absent', 'Excused', 'Attendance %']}
      rows={meets.map(m => {
        const marked = people.filter(p => p.id in m.s)
        const count = status => marked.filter(p => m.s[p.id] === status).length
        return <tr key={m.d}><td>{m.d}</td>{people.map(p => <td key={p.id}>{attendanceLabel(m.s[p.id])}</td>)}
          <td>{count('P')}</td><td>{count('A')}</td><td>{count('E')}</td>
          <td>{marked.length ? `${(count('P') / marked.length * 100).toFixed(1)}%` : '—'}</td></tr>
      })} />
    <T title="2. Cumulative attendance by member" head={['Member', 'Meetings marked', 'Present', 'Absent', 'Excused', 'Attendance %']}
      rows={people.map(p => {
        const marked = meets.filter(m => p.id in m.s)
        const present = marked.filter(m => m.s[p.id] === 'P').length
        const absent = marked.filter(m => m.s[p.id] === 'A').length
        const excused = marked.filter(m => m.s[p.id] === 'E').length
        return <tr key={p.id}><td>{p.name}</td><td>{marked.length}</td><td>{present}</td><td>{absent}</td><td>{excused}</td>
          <td>{marked.length ? `${(present / marked.length * 100).toFixed(1)}%` : '—'}</td></tr>
      })} />
    <T title={`3. Business won (Total ${fm(total)})`} head={['Date', 'Business won by', 'Referring member', 'Client / details', 'Value (₹)']}
      rows={wonNotes.map((n, i) => <tr key={`${n.d}-${n.g}-${n.to}-${i}`}><td>{n.d}</td><td>{nm(n.to)}</td><td>{nm(n.g)}</td><td>{n.det || '—'}</td><td>₹{(+n.v || 0).toLocaleString('en-IN')}</td></tr>)} />
    <T title="4. Referrals passed" head={['Date', 'From', 'Passed to', 'Client / company', 'Status']}
      rows={refs.map((r, i) => <tr key={`${r.d}-${r.f}-${r.to}-${i}`}><td>{r.d}</td><td>{nm(r.f)}</td><td>{nm(r.to)}</td><td>{r.co || '—'}</td><td>{r.st}</td></tr>)} />
    <T title="5. 1-to-1 meetings" head={['Date', 'Member', '1-to-1 with']}
      rows={ones.map((o, i) => <tr key={`${o.d}-${o.f}-${o.to}-${i}`}><td>{o.d}</td><td>{nm(o.f)}</td><td>{nm(o.to)}</td></tr>)} />
    <T title="6. Meeting updates (clients, pipeline and specific asks)" head={['Date', 'Member', 'New client / company', 'Product / service', 'Prospect / pipeline', 'Specific ask / connection needed', 'Action owner']}
      rows={opps.map(o => <tr key={o.id}><td>{o.d}</td><td>{nm(o.m)}</td><td>{o.cl || '—'}</td><td>{o.pr || '—'}</td>
        <td>{o.pp || '—'}</td><td>{o.ask || '—'}</td><td>{nm(o.ow)}</td></tr>)} />
    <T title="7. Specific connects" head={['Date', 'Requesting member', 'Target company / industry', 'Contact person', 'Specific connection / ask', 'Connect owner', 'Status', 'Intro date', 'Business won (₹)']}
      rows={cons.map(c => <tr key={c.id}><td>{c.d}</td><td>{nm(c.f)}</td><td>{c.t || '—'}</td><td>{c.cp || '—'}</td>
        <td>{c.ask || '—'}</td><td>{c.ow ? nm(c.ow) : 'Not assigned'}</td><td>{c.st || '—'}</td><td>{c.intro || '—'}</td>
        <td>{c.won ? `₹${(+c.won).toLocaleString('en-IN')}` : '—'}</td></tr>)} />
    <T title="8. Additional member activities" head={['Date', 'Activity', 'Member', 'With', 'Notes']}
      rows={acts.map((a, i) => <tr key={a.id || `${a.d}-${a.f}-${i}`}><td>{a.d}</td><td>{a.t || '—'}</td><td>{nm(a.f)}</td><td>{nm(a.to)}</td><td>{a.note || '—'}</td></tr>)} />
    <T title="9. Minutes of meeting" head={['Meeting', 'Date', 'Time', 'Venue', 'Meeting by', 'Welcome / introduction', 'Visitors', 'Member presentation / updates', 'Other notes']}
      rows={moms.map(m => <tr key={m.no}><td>{m.no}</td><td>{m.d}</td><td>{m.t || '—'}</td><td>{m.venue || '—'}</td>
        <td>{m.by || '—'}</td><td>{[m.welcome, m.intro].filter(Boolean).join(' · ') || '—'}</td><td>{m.visitors || '—'}</td>
        <td>{m.present || '—'}</td><td>{[m.joint, m.socials, m.other].filter(Boolean).join(' · ') || '—'}</td></tr>)} />
    <T title="10. Meeting action points" head={['Meeting', 'Action point', 'Target date', 'Responsible member', 'Status', 'Follow-up']}
      rows={moms.flatMap(m => (m.ap || []).map((a, i) => <tr key={`${m.no}-${i}`}><td>{m.no}</td><td>{a.p || '—'}</td><td>{a.tl || '—'}</td>
        <td>{a.r || '—'}</td><td>{a.st || '—'}</td><td>{a.fu || '—'}</td></tr>))} />
    <T title="11. Business Network" head={u.role === 'sa' ? ['SNO', 'Week', 'Power Team', 'Name', 'Specific Give', 'Specific Ask'] : ['SNO', 'Week', 'Name', 'Specific Give', 'Specific Ask']}
      rows={networkEntries.map(entry => <tr key={entry.id}><td>{entry.sno}</td><td>{entry.week}</td>
        {u.role === 'sa' && <td>{TEAMS[(U(entry.member)?.team || 1) - 1]}</td>}
        <td>{nm(entry.member)}</td><td>{entry.give}</td><td>{entry.ask}</td></tr>)} />
    <T title="12. Power Team meeting schedules" head={['Power Team', 'Date', 'Time', 'Venue', 'Scheduled by']}
      rows={schedules.map(schedule => <tr key={schedule.team}><td>{TEAMS[schedule.team - 1]}</td><td>{schedule.d}</td>
        <td>{schedule.t}</td><td>{schedule.venue}</td><td>{nm(schedule.by)}</td></tr>)} />
  </div>
}
