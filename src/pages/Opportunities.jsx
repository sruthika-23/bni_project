import Icon from '../icons'
import { toastOk } from '../toast'
import Select from '../Select'
import { useState } from 'react'
import { useDB, me, U, scope, addOpp, delOpp, fmtD, isoToday, dv, canManage } from '../store'
import { PageHead, Table } from '../ui'

const Chips = ({ v }) => { const a = String(v || '').split(';').map(s => s.trim()).filter(Boolean); return a.length ? a.map(s => <span key={s} className="chip">{s}</span>) : '—' }
const blank = u => ({ d: isoToday(), m: u.role === 'mb' ? u.id : u.role === 'th' ? u.id : '', cl: '', pr: '', pp: '', ask: '', ow: '' })

export default function Opportunities() {
  const db = useDB(), u = me(), people = scope(u)
  const [f, setF] = useState(() => blank(u)), [q, Sq] = useState(''), [mem, Sm] = useState('all'), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setOk('') }
  const list = db.opps.filter(o => (u.role === 'sa' || U(o.m)?.team === u.team) && (mem === 'all' || o.m === +mem)
    && [o.cl, o.pr, o.pp, o.ask, U(o.m)?.name, U(o.ow)?.name].join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => dv(b.d) - dv(a.d) || a.id - b.id)
  const submit = e => {
    e.preventDefault()
    const m = u.role === 'mb' ? u.id : +f.m
    if (!f.d) return setErr('Select the meeting date.')
    if (!m) return setErr('Choose the reporting member.')
    if (![f.cl, f.pr, f.pp, f.ask].some(x => x.trim())) return setErr('Enter a client, prospect or specific ask.')
    addOpp({ d: fmtD(f.d), m, cl: f.cl.trim(), pr: f.pr.trim(), pp: f.pp.trim(), ask: f.ask.trim(), ow: f.ow ? +f.ow : null })
    setF(blank(u)); setErr(''); setOk(toastOk('Record added. Any specific ask also appears in Specific Connects.'))
  }
  return <>
    <PageHead eyebrow="MEETING UPDATES" title="Opportunities" sub="New clients, active prospects and specific connection requests reported at each bi-weekly meeting." />
    {u.role !== 'mb' && <form className="card" onSubmit={submit}>
      <h3 className="font-semibold mb-3">Add meeting update</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div><label className="lbl">Meeting date *</label><input className="inp" type="date" value={f.d} onChange={set('d')} /></div>
        {u.role !== 'mb' && <div><label className="lbl">Reporting member *</label><Select className="inp" value={f.m} onChange={set('m')}><option value="">Choose member</option>{people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>}
        <div><label className="lbl">New client / company</label><input className="inp" value={f.cl} onChange={set('cl')} /></div>
        <div><label className="lbl">Product / service</label><input className="inp" value={f.pr} onChange={set('pr')} /></div>
        <div><label className="lbl">Prospect / pipeline client</label><input className="inp" value={f.pp} onChange={set('pp')} /></div>
        <div><label className="lbl">Specific ask / connection needed</label><input className="inp" value={f.ask} onChange={set('ask')} placeholder="Separate several with ;" /></div>
        <div><label className="lbl">Action owner</label><Select className="inp" value={f.ow} onChange={set('ow')}><option value="">Not assigned</option>{people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
      </div>
      <div className="flex items-center gap-3 mt-4"><button className="btn"><Icon name="plus" size={15} stroke={2.6} /> Add record</button>{err && <span className="text-sm text-bni">{err}</span>}{ok && <span className="text-sm text-green-700">{ok}</span>}</div>
    </form>}
    <div className="card filter-row mt-4"><input className="inp" placeholder="Search company, product, ask or member..." value={q} onChange={e => Sq(e.target.value)} />
      <Select className="inp" value={mem} onChange={e => Sm(e.target.value)}><option value="all">All members</option>{people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select><span className="filter-count">{list.length} records</span></div>
    <Table head={['Meeting date', 'Member', 'New client / company', 'Product / service', 'Prospect / pipeline', 'Specific ask / connection needed', 'Action owner', '']} rows={list.map(o => <tr key={o.id}>
      <td className="td">{o.d}</td><td className="td font-semibold">{U(o.m)?.name}</td>
      <td className="td !whitespace-normal min-w-[190px]">{o.cl || '—'}</td><td className="td !whitespace-normal min-w-[150px]">{o.pr || '—'}</td><td className="td !whitespace-normal min-w-[150px]">{o.pp || '—'}</td>
      <td className="td !whitespace-normal min-w-[200px]"><Chips v={o.ask} /></td><td className="td">{U(o.ow)?.name || '—'}</td>
      <td className="td">{(o.m === u.id || canManage(u, U(o.m))) && <button className="btn-s" onClick={() => window.confirm('Delete this record?') && delOpp(o)}>Delete</button>}</td></tr>)} />
  </>
}
