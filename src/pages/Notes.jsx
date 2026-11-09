import Select from '../Select'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDB, me, U, SRC, STG, teamUsers, won, rv, att, goalOf, addNote, advance } from '../store'
import { Tiles, Table, Pill, fm, RC } from '../ui'

const SC = ['n', 'a', 'g']
const TABS = ['Thank-you notes', 'Referrals', '1-to-1s', 'Joint calls', 'Meetings', 'Business converted']

function NoteTable({ list, u, db, onErr }) {
  return <Table head={['Date', 'From', 'To', 'Because of', 'Details', 'Value', 'Stage', '']} rows={list.map(n => (
    <tr key={db.notes.indexOf(n)}><td className="td">{n.d}</td><td className="td">{U(n.g).name}</td><td className="td">{U(n.to).name}</td><td className="td">{n.src}</td>
      <td className="td !whitespace-normal min-w-[180px]">{n.det}</td><td className="td">{n.v ? fm(n.v) : '–'}</td><td className="td"><Pill c={SC[n.st]}>{STG[n.st]}</Pill></td>
      <td className="td">{n.st < 2 && n.to === u.id && <button className="btn-s" onClick={() => onErr(advance(n))}>{n.st ? 'Convert to business' : 'Confirm value'}</button>}</td></tr>))} />
}

export default function Notes() {
  const db = useDB(), u = me(), loc = useLocation()
  const [f, setF] = useState({ to: '', src: SRC[0], det: '', v: '' }), [err, setErr] = useState('')
  const [rid, setRid] = useState(loc.state?.rid || u.id), [tab, setTab] = useState(0)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const send = () => {
    if (!f.to) return setErr('Choose a member to thank.')
    if (!f.det.trim()) return setErr('Add a short detail.')
    addNote({ g: u.id, to: +f.to, src: f.src, det: f.det.trim(), v: +f.v || 0 }); setF({ to: '', src: SRC[0], det: '', v: '' }); setErr('')
  }
  const inScope = id => u.role === 'sa' || id === u.id || (u.role === 'th' && U(id).team === u.team)
  const feed = db.notes.filter(n => inScope(n.g) || inScope(n.to))
  const pick = u.role === 'sa' ? db.users : u.role === 'th' ? teamUsers(u.team) : [u]
  const r = U(rid) || u
  const jc = db.acts.filter(a => a.t === 'Joint call' && (a.f === r.id || a.to === r.id)).map(a => ({ d: a.d, g: a.f, to: a.to, det: a.note || '—' }))
  const oo = db.ones.filter(o => o.f === r.id || o.to === r.id), a = att(r.id)
  const rows = [
    <NoteTable key="n" list={db.notes.filter(n => n.g === r.id || n.to === r.id)} u={u} db={db} onErr={setErr} />,
    <Table key="r" head={['Direction', 'Member', 'Company', 'Status']} rows={db.refs.filter(x => x.f === r.id || x.to === r.id).map((x, i) => <tr key={i}><td className="td">{x.f === r.id ? 'Passed to' : 'Received from'}</td><td className="td">{U(x.f === r.id ? x.to : x.f).name}</td><td className="td">{x.co}</td><td className="td"><Pill c={RC[x.st]}>{x.st}</Pill></td></tr>)} />,
    <Table key="o" head={['Date', 'With']} rows={oo.map((o, i) => <tr key={i}><td className="td">{o.d}</td><td className="td">{U(o.f === r.id ? o.to : o.f).name}</td></tr>)} />,
    <Table key="j" head={['Date', 'With', 'Details']} rows={jc.map((n, i) => <tr key={i}><td className="td">{n.d}</td><td className="td">{U(n.g === r.id ? n.to : n.g).name}</td><td className="td">{n.det}</td></tr>)} />,
    <Table key="m" head={['Meeting', 'Attendance']} rows={db.meets.map(m => <tr key={m.d}><td className="td">{m.d}</td><td className="td">{r.id in m.s ? <Pill c={m.s[r.id] === 'P' ? 'g' : 'r'}>{m.s[r.id] === 'P' ? 'Present' : 'Absent'}</Pill> : 'Not recorded'}</td></tr>)} />,
    <Table key="b" head={['Date', 'Details', 'Value', 'Credited because']} rows={db.notes.filter(n => n.st === 2 && (n.g === r.id || n.to === r.id)).map((n, i) => <tr key={i}><td className="td">{n.d}</td><td className="td">{n.det}</td><td className="td">{fm(n.v)}</td><td className="td">{n.g === r.id ? 'Business I closed' : 'Referral I generated'}</td></tr>)} />,
  ]
  return (
    <div>
      <h1 className="text-2xl font-bold">Thank-you notes</h1>
      <p className="text-gray-600 mb-4">Thank a member for a visit, meeting, joint call, 1-to-1 or direct referral. The member you thank confirms the value, then converts it into business.</p>
      {u.role !== 'mb' && <div className="card grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div><label className="lbl">Thank</label><Select className="inp" value={f.to} onChange={set('to')}><option value="">Choose member…</option>{db.users.filter(x => x.id !== u.id).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></div>
        <div><label className="lbl">Because of</label><Select className="inp" value={f.src} onChange={set('src')}>{SRC.map(s => <option key={s}>{s}</option>)}</Select></div>
        <div><label className="lbl">Details</label><input className="inp" value={f.det} onChange={set('det')} /></div>
        <div><label className="lbl">Value (₹)</label><input className="inp" type="number" min="0" value={f.v} onChange={set('v')} /></div>
        <button className="btn" onClick={send}>Send note</button>
      </div>}
      {err && <div className="text-sm text-bni mt-2">{err}</div>}
      <h2 className="h2">{u.role === 'mb' ? 'My notes' : 'Notes in my scope'}</h2>
      <NoteTable list={feed} u={u} db={db} onErr={setErr} />
      <h2 className="h2">Individual records</h2>
      {pick.length > 1 && <Select className="inp !w-72 mb-3" value={r.id} onChange={e => setRid(+e.target.value)}>{pick.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Select>}
      <Tiles items={[['Business converted', fm(won(r.id))], ['Referral value generated', fm(rv(r.id))], ['Notes given', db.notes.filter(n => n.g === r.id).length], ['Notes received', db.notes.filter(n => n.to === r.id).length], ['1-to-1s · joint calls', `${oo.length} · ${jc.length}`], ['Attendance', a === null ? '–' : a.toFixed(0) + '%']]} />
      <div className="flex gap-2 flex-wrap my-3">{TABS.map((t, i) => <button key={t} className={i === tab ? 'btn' : 'btn-s'} onClick={() => setTab(i)}>{t}</button>)}</div>
      {rows[tab]}
    </div>
  )
}
