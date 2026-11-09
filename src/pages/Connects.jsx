import Icon from '../icons'
import { toastOk } from '../toast'
import Select from '../Select'
import { useState } from 'react'
import { useDB, me, U, scope, addConnect, updConnect, fmtD, isoToday, dv, fm, canManage } from '../store'
import { PageHead, Tiles, Table, Pill } from '../ui'

const CS = ['Requested', 'Introduced', 'In discussion', 'Won', 'Closed']
const CC = { Requested: 'n', Introduced: 'a', 'In discussion': 'a', Won: 'g', Closed: 'n' }
const blank = u => ({ d: isoToday(), f: u.role === 'mb' || u.role === 'th' ? u.id : '', t: '', cp: '', ask: '', ow: '' })
const nowD = () => fmtD(isoToday())

export default function Connects() {
  const db = useDB(), u = me(), people = scope(u)
  const [f, setF] = useState(() => blank(u)), [q, Sq] = useState(''), [st, Ss] = useState('all'), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setOk('') }
  const all = db.connects.filter(c => u.role === 'sa' || U(c.f)?.team === u.team)
  const list = all.filter(c => (st === 'all' || c.st === st) && [c.t, c.cp, c.ask, U(c.f)?.name, U(c.ow)?.name].join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => dv(b.d) - dv(a.d) || a.id - b.id)
  const can = c => canManage(u, U(c.f)) || c.f === u.id || c.ow === u.id
  const submit = e => {
    e.preventDefault()
    const m = u.role === 'mb' ? u.id : +f.f
    if (!m) return setErr('Choose the requesting member.')
    if (!f.t.trim()) return setErr('Enter the target company / industry.')
    addConnect({ d: fmtD(f.d), f: m, t: f.t.trim(), cp: f.cp.trim(), ask: f.ask.trim(), ow: f.ow ? +f.ow : null })
    setF(blank(u)); setErr(''); setOk(toastOk('Connect request added.'))
  }
  const setStatus = (c, s) => updConnect(c, { st: s, intro: s !== 'Requested' && !c.intro ? nowD() : s === 'Requested' ? '' : c.intro })
  return <>
    <PageHead eyebrow="REFERRAL REQUESTS" title="Specific Connects" sub="Track every connection a member has asked the Power Team to help with." />
    <Tiles items={[['Total requests', all.length], ['Requested', all.filter(c => c.st === 'Requested').length], ['Introduced / in talks', all.filter(c => c.st === 'Introduced' || c.st === 'In discussion').length], ['Won', all.filter(c => c.st === 'Won').length], ['Without owner', all.filter(c => !c.ow).length], ['Business won', fm(all.reduce((a, c) => a + (+c.won || 0), 0))]]} />
    {u.role !== 'mb' && <form className="card mt-4" onSubmit={submit}>
      <h3 className="font-semibold mb-3">Add a connect request</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div><label className="lbl">Date requested *</label><input className="inp" type="date" value={f.d} onChange={set('d')} /></div>
        {u.role !== 'mb' && <div><label className="lbl">Requesting member *</label><Select className="inp" value={f.f} onChange={set('f')}><option value="">Choose member</option>{people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>}
        <div><label className="lbl">Target company / industry *</label><input className="inp" value={f.t} onChange={set('t')} /></div>
        <div><label className="lbl">Contact person / designation</label><input className="inp" value={f.cp} onChange={set('cp')} /></div>
        <div><label className="lbl">Specific connection / ask</label><input className="inp" value={f.ask} onChange={set('ask')} /></div>
        <div><label className="lbl">Connect owner (helping member)</label><Select className="inp" value={f.ow} onChange={set('ow')}><option value="">Not assigned</option>{people.filter(p => p.id !== (u.role === 'mb' ? u.id : +f.f)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      </div>
      <div className="flex items-center gap-3 mt-4"><button className="btn"><Icon name="plus" size={15} stroke={2.6} /> Add request</button>{err && <span className="text-sm text-bni">{err}</span>}{ok && <span className="text-sm text-green-700">{ok}</span>}</div>
    </form>}
    <div className="card filter-row mt-4"><input className="inp" placeholder="Search target, contact or member..." value={q} onChange={e => Sq(e.target.value)} />
      <Select className="inp" value={st} onChange={e => Ss(e.target.value)}><option value="all">All statuses</option>{CS.map(s => <option key={s}>{s}</option>)}</Select><span className="filter-count">{list.length} requests</span></div>
    <Table head={['Date requested', 'Requesting member', 'Target company / industry', 'Contact person / designation', 'Specific connection / ask', 'Connect owner', 'Status', 'Intro date', 'Business won (₹)']} rows={list.map(c => {
      const e = can(c)
      return <tr key={c.id}><td className="td">{c.d}</td><td className="td font-semibold">{U(c.f)?.name}</td><td className="td !whitespace-normal min-w-[190px]">{c.t}</td>
        <td className="td">{e ? <input key={c.cp} className="inp !w-40" defaultValue={c.cp} onBlur={x => x.target.value !== c.cp && updConnect(c, { cp: x.target.value.trim() })} /> : c.cp || '—'}</td>
        <td className="td">{e ? <input key={c.ask} className="inp !w-44" defaultValue={c.ask} onBlur={x => x.target.value !== c.ask && updConnect(c, { ask: x.target.value.trim() })} /> : c.ask || '—'}</td>
        <td className="td">{e ? <Select className="inp !w-40" value={c.ow || ''} onChange={x => updConnect(c, { ow: x.target.value ? +x.target.value : null })}><option value="">Not assigned</option>{people.filter(p => p.id !== c.f).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select> : U(c.ow)?.name || '—'}</td>
        <td className="td">{e ? <Select className="inp !w-36" value={c.st} onChange={x => setStatus(c, x.target.value)}>{CS.map(s => <option key={s}>{s}</option>)}</Select> : <Pill c={CC[c.st]}>{c.st}</Pill>}</td>
        <td className="td">{c.intro || '—'}</td>
        <td className="td">{e ? <input key={c.won} className="inp !w-32" type="number" min="0" defaultValue={c.won || ''} onBlur={x => +x.target.value !== (+c.won || 0) && updConnect(c, { won: +x.target.value || 0 })} /> : c.won ? fm(c.won) : '—'}</td></tr>
    })} />
  </>
}
