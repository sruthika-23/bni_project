import Icon from '../icons'
import { useState } from 'react'
import { useDB, me, U, scope, TEAMS, fm, fmtD, toIso, isoToday, addMom, updMom } from '../store'
import { PageHead, Table, Pill } from '../ui'

const OPT = { P: 'Present', A: 'Absent', E: 'Excused' }, CL = { P: 'g', A: 'r', E: 'a' }
const t12 = t => { if (!t) return '—'; const [h, m] = t.split(':'); return `${+h % 12 || 12}:${m} ${+h < 12 ? 'AM' : 'PM'}` }
const AG = [['welcome', 'Welcome address by Captain (1 min)'], ['intro', 'Power Team members introduction'], ['visitors', 'Visitors introduction'], ['present', 'Members give their presentation (2–3 mins)']]
const blankAp = () => ({ p: '', tl: '', r: '', st: '', fu: '' })
const blank = (u, moms) => ({ no: Math.max(0, ...moms.map(m => m.no)) + 1, team: u.team || 1, d: fmtD(isoToday()), t: '08:30', venue: '', captain: '', by: u.name, welcome: '', intro: '', visitors: '', present: '', joint: '0', socials: '', other: '', ap: [blankAp()], nd: '', nt: '08:30', nv: '' })

function MomForm({ init, isNew, onSave, onCancel }) {
  const [f, setF] = useState(init), [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const setAp = (i, k, v) => setF({ ...f, ap: f.ap.map((a, j) => j === i ? { ...a, [k]: v } : a) })
  const submit = e => {
    e.preventDefault()
    if (!f.d) return setErr('Select the meeting date.')
    if (!(+f.no > 0)) return setErr('Enter a valid meeting number.')
    onSave({ ...f, no: +f.no, ap: f.ap.filter(a => a.p.trim()) }, setErr)
  }
  return <form className="card" onSubmit={submit}>
    <h3 className="font-semibold mb-3">{isNew ? 'New minutes of meeting' : `Edit minutes · Meeting ${f.no}`}</h3>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div><label className="lbl">Meeting no. *</label><input className="inp" type="number" min="1" value={f.no} onChange={set('no')} disabled={!isNew} /></div>
      <div><label className="lbl">Date *</label><input className="inp" type="date" value={toIso(f.d)} onChange={e => setF({ ...f, d: fmtD(e.target.value) })} /></div>
      <div><label className="lbl">Time</label><input className="inp" type="time" value={f.t} onChange={set('t')} /></div>
      <div><label className="lbl">Venue</label><input className="inp" value={f.venue} onChange={set('venue')} /></div>
      <div><label className="lbl">Captain / Chair</label><input className="inp" value={f.captain} onChange={set('captain')} /></div>
      <div><label className="lbl">Minutes prepared by</label><input className="inp" value={f.by} onChange={set('by')} /></div>
    </div>
    <h4 className="font-semibold mt-5 mb-2 text-sm">Agenda & points of discussion</h4>
    <div className="grid sm:grid-cols-2 gap-3">
      {AG.map(([k, l]) => <div key={k}><label className="lbl">{l}</label><textarea className="inp" rows="2" value={f[k]} onChange={set(k)} /></div>)}
      <div><label className="lbl">Joint presentations (nos.)</label><input className="inp" value={f.joint} onChange={set('joint')} /></div>
      <div><label className="lbl">Socials (nos.)</label><input className="inp" value={f.socials} onChange={set('socials')} /></div>
      <div className="sm:col-span-2"><label className="lbl">Other activity / names</label><input className="inp" value={f.other} onChange={set('other')} /></div>
    </div>
    <h4 className="font-semibold mt-5 mb-2 text-sm">Action plan</h4>
    {f.ap.map((a, i) => <div key={i} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-2">
      <input className="inp" placeholder="Particulars" value={a.p} onChange={e => setAp(i, 'p', e.target.value)} />
      <input className="inp" type="date" value={toIso(a.tl)} onChange={e => setAp(i, 'tl', fmtD(e.target.value))} />
      <input className="inp" placeholder="Responsibility" value={a.r} onChange={e => setAp(i, 'r', e.target.value)} />
      <input className="inp" placeholder="Status" value={a.st} onChange={e => setAp(i, 'st', e.target.value)} />
      <div className="flex gap-2"><input className="inp" placeholder="Follow-up" value={a.fu} onChange={e => setAp(i, 'fu', e.target.value)} /><button type="button" className="btn-s" aria-label="Remove row" onClick={() => setF({ ...f, ap: f.ap.filter((_, j) => j !== i) })}>✕</button></div></div>)}
    <button type="button" className="btn-s" onClick={() => setF({ ...f, ap: [...f.ap, blankAp()] })}><Icon name="plus" size={15} stroke={2.6} /> Add action</button>
    <h4 className="font-semibold mt-5 mb-2 text-sm">Next meeting</h4>
    <div className="grid sm:grid-cols-3 gap-3">
      <div><label className="lbl">Date</label><input className="inp" type="date" value={toIso(f.nd)} onChange={e => setF({ ...f, nd: fmtD(e.target.value) })} /></div>
      <div><label className="lbl">Time</label><input className="inp" type="time" value={f.nt} onChange={set('nt')} /></div>
      <div><label className="lbl">Venue</label><input className="inp" value={f.nv} onChange={set('nv')} /></div>
    </div>
    <div className="flex items-center gap-3 mt-5"><button className="btn">Save minutes</button><button type="button" className="btn-s" onClick={onCancel}>Cancel</button>{err && <span className="text-sm text-bni">{err}</span>}</div>
  </form>
}

const Field = ({ l, v }) => <div className="mom-field"><small>{l}</small><b>{v || '—'}</b></div>

export default function Minutes() {
  const db = useDB(), u = me(), manage = u.role !== 'mb'
  const moms = db.moms.filter(m => u.role === 'sa' || m.team === u.team)
  const [sel, setSel] = useState(null), [mode, setMode] = useState('view')
  const m = moms.find(x => x.no === sel) || moms[moms.length - 1]
  const save = (obj, setErr) => {
    if (mode === 'new') { if (db.moms.some(x => x.no === obj.no)) return setErr('That meeting number already has minutes.'); addMom(obj) } else updMom(obj.no, obj)
    setSel(obj.no); setMode('view')
  }
  const head = <PageHead eyebrow="MINUTES OF MEETING" title="Minutes of Meeting" sub="Attendance, agenda, member-wise updates, business generated and the action plan for each meeting."
    action={manage && mode === 'view' ? <button className="btn" onClick={() => setMode('new')}><Icon name="plus" size={15} stroke={2.6} /> New minutes</button> : null} />
  if (mode !== 'view') return <>{head}<MomForm init={mode === 'new' ? blank(u, db.moms) : m} isNew={mode === 'new'} onSave={save} onCancel={() => setMode('view')} /></>
  if (!m) return <>{head}<div className="card text-sm text-gray-500">No minutes recorded yet.</div></>
  const att = db.meets.find(x => x.d === m.d), team = scope({ ...u, role: 'th', team: m.team })
  const annex = db.opps.filter(o => o.d === m.d && U(o.m)?.team === m.team), biz = db.notes.filter(n => n.st === 2 && n.d === m.d && U(n.g)?.team === m.team)
  const agenda = [...AG.map(([k, l]) => [l, m[k]]), ['Meeting updates', 'See annexure below'], ['Business generated', biz.length ? `${biz.length} record${biz.length > 1 ? 's' : ''} · ${fm(biz.reduce((a, n) => a + n.v, 0))}` : 'None recorded'], ['Joint presentations (nos.)', m.joint], ['Socials (nos.)', m.socials], ['Other activity / names', m.other]]
  return <div className="mom">
    {head}
    <div className="flex gap-2 flex-wrap mb-4 no-print">{moms.map(x => <button key={x.no} className={x.no === m.no ? 'btn' : 'btn-s'} onClick={() => setSel(x.no)}>Meeting {x.no} · {x.d}</button>)}
      <span className="ml-auto flex gap-2">{manage && <button className="btn-s" onClick={() => setMode('edit')}>Edit</button>}<button className="btn-s" onClick={() => window.print()}>Print</button></span></div>
    <section className="card"><div className="mom-grid">
      <Field l="Power Team" v={TEAMS[m.team - 1]} /><Field l="Meeting no." v={m.no} /><Field l="Chapter" v="BNI Knights" /><Field l="Date" v={m.d} />
      <Field l="Time" v={t12(m.t)} /><Field l="Venue" v={m.venue} /><Field l="Captain / Chair" v={m.captain} /><Field l="Minutes prepared by" v={m.by} /></div></section>
    <h2 className="h2">Attendance</h2>
    <Table head={['#', 'Member', 'Status']} rows={team.map((p, i) => <tr key={p.id}><td className="td">{i + 1}</td><td className="td font-semibold">{p.name}</td><td className="td">{att?.s[p.id] ? <Pill c={CL[att.s[p.id]]}>{OPT[att.s[p.id]]}</Pill> : 'Not recorded'}</td></tr>)} />
    <h2 className="h2">Agenda & points of discussion</h2>
    <Table head={['#', 'Item', 'Notes']} rows={agenda.map(([l, v], i) => <tr key={i}><td className="td">{i + 1}</td><td className="td font-semibold">{l}</td><td className="td !whitespace-normal min-w-[260px]">{v || '—'}</td></tr>)} />
    <h2 className="h2">Annexure · member-wise meeting details</h2>
    <Table head={['S.No', 'Member', 'New client / company', 'Product / service', 'Prospect / pipeline', 'Specific ask']} rows={annex.map((o, i) => <tr key={o.id}><td className="td">{i + 1}</td><td className="td font-semibold">{U(o.m)?.name}</td><td className="td !whitespace-normal min-w-[180px]">{o.cl || '—'}</td><td className="td !whitespace-normal min-w-[140px]">{o.pr || '—'}</td><td className="td !whitespace-normal min-w-[140px]">{o.pp || '—'}</td><td className="td !whitespace-normal min-w-[180px]">{(o.ask || '—').replace(/;\s*/g, ', ')}</td></tr>)} />
    <h2 className="h2">Business generated</h2>
    <Table head={['S.No', 'Generated by', 'Credited to', 'Details', 'Value']} rows={biz.map((n, i) => <tr key={i}><td className="td">{i + 1}</td><td className="td font-semibold">{U(n.g)?.name}</td><td className="td">{U(n.to)?.name}</td><td className="td">{n.det}</td><td className="td">{fm(n.v)}</td></tr>)} />
    <h2 className="h2">Action plan</h2>
    <Table head={['S.No', 'Particulars', 'Timeline', 'Responsibility', 'Status', 'Follow-up']} rows={m.ap.map((a, i) => <tr key={i}><td className="td">{i + 1}</td><td className="td font-semibold">{a.p}</td><td className="td">{a.tl || '—'}</td><td className="td">{a.r || '—'}</td><td className="td">{a.st || '—'}</td><td className="td">{a.fu || '—'}</td></tr>)} />
    <section className="card mt-4"><div className="mom-grid"><Field l="Next meeting date" v={m.nd} /><Field l="Time" v={t12(m.nt)} /><Field l="Venue" v={m.nv} /></div></section>
  </div>
}
