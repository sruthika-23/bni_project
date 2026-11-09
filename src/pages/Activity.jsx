import Icon from '../icons'
import { toastOk } from '../toast'
import Select from '../Select'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDB, me, U, scope, addOne, addAct, fmtD, isoToday, dv } from '../store'
import { PageHead, Tiles, Table, Pill } from '../ui'

const KINDS = ['1-to-1', 'Joint call', 'Power Date']
const KC = { '1-to-1': 'g', 'Referral passed': 'a', 'Joint call': 'n', 'Power Date': 'n' }

export default function Activity({ only }) {
  const db = useDB(), u = me(), people = scope(u), ids = people.map(p => p.id)
  const kinds = only ? [only] : KINDS
  const [f, setF] = useState({ d: isoToday(), by: '', k: kinds[0], to: '', note: '' }), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const [kind, Sk] = useState('all'), [mem, Sm] = useState('all')
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setOk('') }
  const rows = [
    ...db.ones.map(o => ({ d: o.d, by: o.f, k: '1-to-1', to: o.to, note: '' })),
    ...db.refs.map(r => ({ d: r.d, by: r.f, k: 'Referral passed', to: r.to, note: [r.co, r.cn].filter(Boolean).join(' · ') })),
    ...db.acts.map(a => ({ d: a.d, by: a.f, k: a.t, to: a.to, note: a.note })),
  ].filter(r => (ids.includes(r.by) || ids.includes(r.to)) && (only ? r.k === only : (kind === 'all' || r.k === kind)) && (mem === 'all' || r.by === +mem)).sort((a, b) => dv(b.d) - dv(a.d))
  const by = u.role === 'mb' || !f.by ? u.id : +f.by
  const submit = e => {
    e.preventDefault()
    if (!f.d) return setErr('Select the date.')
    if (!f.to) return setErr('Choose the member you met.')
    if (+f.to === by) return setErr('Choose a different member.')
    if (f.k === '1-to-1') addOne(by, +f.to, fmtD(f.d)); else addAct({ t: f.k, f: by, to: +f.to, d: fmtD(f.d), note: f.note.trim() })
    setF({ ...f, to: '', note: '' }); setErr(''); setOk(toastOk(only ? 'Joint call recorded.' : 'Activity recorded.'))
  }
  const count = k => db[k === '1-to-1' ? 'ones' : 'acts'].filter(a => (k === '1-to-1' || a.t === k) && ids.includes(a.f)).length
  return <>
    <PageHead eyebrow="MEMBER-TO-MEMBER TRACKER" title={only ? 'Joint Calls' : 'Activity Tracker'} sub={only ? 'Record the calls you made together with another member and review your history.' : 'One row per 1-to-1, referral, joint call or Power Date since the previous bi-weekly meeting.'} />
    {only ? <Tiles items={[['Joint calls', rows.length], ['Made by me', rows.filter(r => r.by === u.id).length], ['Made with me', rows.filter(r => r.to === u.id).length]]} />
      : <Tiles items={[['1-to-1s', count('1-to-1')], ['Referrals passed', db.refs.filter(r => ids.includes(r.f)).length], ['Joint calls', count('Joint call')], ['Power Dates', count('Power Date')]]} />}
    {(only || u.role !== 'mb') && <form className="card mt-4" onSubmit={submit}>
      <h3 className="font-semibold mb-3">{only ? 'Log a joint call' : 'Record an activity'}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div><label className="lbl">Date *</label><input className="inp" type="date" value={f.d} onChange={set('d')} /></div>
        {u.role !== 'mb' && <div><label className="lbl">Reporting member</label><Select className="inp" value={f.by} onChange={set('by')}><option value="">Myself</option>{people.filter(p => p.id !== u.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>}
        {!only && <div><label className="lbl">Activity *</label><Select className="inp" value={f.k} onChange={set('k')}>{kinds.map(k => <option key={k}>{k}</option>)}</Select></div>}
        <div><label className="lbl">With (member) *</label><Select className="inp" value={f.to} onChange={set('to')}><option value="">Choose member</option>{people.filter(p => p.id !== by).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
        <div><label className="lbl">Notes</label><input className="inp" value={f.note} onChange={set('note')} /></div>
      </div>
      <div className="flex items-center gap-3 mt-4"><button className="btn"><Icon name="plus" size={15} stroke={2.6} /> Record</button>{err && <span className="text-sm text-bni">{err}</span>}{ok && <span className="text-sm text-green-700">{ok}</span>}{!only && <span className="text-xs text-gray-500 ml-auto">To log a referral, use <Link className="text-bni" to="/referrals">Referrals</Link>.</span>}</div>
    </form>}
    <div className="card filter-row mt-4">{!only && <Select className="inp" value={kind} onChange={e => Sk(e.target.value)}><option value="all">All activity</option>{[...KINDS, 'Referral passed'].map(k => <option key={k}>{k}</option>)}</Select>}
      <Select className="inp" value={mem} onChange={e => Sm(e.target.value)}><option value="all">All members</option>{people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select><span className="filter-count">{rows.length} {only ? 'joint calls' : 'activities'}</span></div>
    <Table head={only ? ['Date', 'Reporting member', 'With', 'Notes'] : ['Date', 'Reporting member', 'Activity', 'With', 'Notes']} rows={rows.map((r, i) => <tr key={i}><td className="td">{r.d}</td><td className="td font-semibold">{U(r.by)?.name}</td>{!only && <td className="td"><Pill c={KC[r.k]}>{r.k}</Pill></td>}<td className="td">{U(r.to)?.name}</td><td className="td !whitespace-normal">{r.note || '—'}</td></tr>)} />
  </>
}
