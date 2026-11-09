import { toastOk } from '../toast'
import Select from '../Select'
import { useState } from 'react'
import { useDB, me, scope, addMeeting, fmtD, isoToday, canManage } from '../store'
import { PageHead, Tiles, Table, Pill } from '../ui'

const OPT = { P: 'Present', A: 'Absent', E: 'Excused' }, CL = { P: 'g', A: 'r', E: 'a' }
const first = n => n.split(' ')[0]

export default function Attendance() {
  const db = useDB(), u = me(), people = scope(u), edit = u.role !== 'mb'
  const [d, setD] = useState(isoToday()), [s, setS] = useState({}), [ok, setOk] = useState('')
  const existing = db.meets.find(m => m.d === fmtD(d))
  const val = id => s[id] || existing?.s[id] || 'P'
  const save = () => { if (!d) return; addMeeting(fmtD(d), Object.fromEntries(people.map(p => [p.id, val(p.id)]))); setS({}); setOk(toastOk(`Attendance saved for ${fmtD(d)}.`)) }
  const per = db.meets.map(m => { const rec = people.filter(p => p.id in m.s), c = k => rec.filter(p => m.s[p.id] === k).length; return { m, P: c('P'), A: c('A'), E: c('E'), pct: rec.length ? c('P') / rec.length * 100 : 0 } })
  const avg = per.length ? per.reduce((a, r) => a + r.pct, 0) / per.length : 0
  return <>
    <PageHead eyebrow="TEAM SCHEDULE" title="Meetings & Attendance" sub="Bi-weekly meeting attendance with a cumulative report for every member. Plan for about 12 meetings from Oct 2026 to Mar 2027." />
    <Tiles items={[['Meetings held', `${db.meets.length} of ~12`], ['Average attendance', `${avg.toFixed(1)}%`], ['Team members', people.length]]} />
    {edit && <div className="card mt-4">
      <h3 className="font-semibold mb-3">Record attendance</h3>
      <div className="max-w-xs mb-3"><label className="lbl">Meeting date</label><input className="inp" type="date" value={d} onChange={e => { setD(e.target.value); setS({}); setOk('') }} /></div>
      {existing && <p className="text-xs text-gray-500 mb-2">Attendance already exists for this date. Saving updates it.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{people.filter(p => u.role === 'sa' || canManage(u, p)).map(p => <div key={p.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded px-3 py-2"><span className="text-sm font-semibold">{p.name}</span>
        <Select className="inp !w-28" value={val(p.id)} onChange={e => { setS({ ...s, [p.id]: e.target.value }); setOk('') }}>{Object.entries(OPT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></div>)}</div>
      <div className="flex items-center gap-3 mt-4"><button className="btn" onClick={save}>Save attendance</button>{ok && <span className="text-sm text-green-700">{ok}</span>}</div>
    </div>}
    <h2 className="h2">Meeting-wise attendance</h2>
    <Table head={['Meeting date', ...people.map(p => first(p.name)), 'Present', 'Absent', 'Excused', 'Attendance %']} rows={per.map(r => <tr key={r.m.d}><td className="td font-semibold">{r.m.d}</td>
      {people.map(p => <td className="td" key={p.id}>{r.m.s[p.id] ? <Pill c={CL[r.m.s[p.id]]}>{OPT[r.m.s[p.id]]}</Pill> : '—'}</td>)}
      <td className="td">{r.P}</td><td className="td">{r.A}</td><td className="td">{r.E}</td><td className="td"><Pill c={r.pct >= 75 ? 'g' : r.pct >= 50 ? 'a' : 'r'}>{r.pct.toFixed(1)}%</Pill></td></tr>)} />
    <h2 className="h2">Cumulative attendance by member</h2>
    <Table head={['Member', 'Meetings marked', 'Present', 'Absent / Excused', 'Attendance %']} rows={people.map(p => {
      const rec = db.meets.filter(m => p.id in m.s), pr = rec.filter(m => m.s[p.id] === 'P').length, a = rec.length ? pr / rec.length * 100 : null
      return <tr key={p.id}><td className="td font-semibold">{p.name}</td><td className="td">{rec.length}</td><td className="td">{pr}</td><td className="td">{rec.length - pr}</td><td className="td">{a == null ? 'Not recorded' : <Pill c={a >= 75 ? 'g' : a >= 50 ? 'a' : 'r'}>{a.toFixed(1)}%</Pill>}</td></tr>
    })} />
  </>
}
