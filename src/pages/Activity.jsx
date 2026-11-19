import Icon from '../icons'
import { toastOk } from '../toast'
import Select from '../Select'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDB, me, U, scope, addOne, addAct, addConnect, fmtD, dv, fm } from '../store'
import { PageHead, Tiles, Table, Pill } from '../ui'

const KINDS = ['1-to-1', 'Joint call', 'Power Date']
const KC = { '1-to-1': 'g', 'Thank-you note': 'a', 'Referral passed': 'a', 'Joint call': 'n', 'Power Date': 'n', 'Specific connect': 'g' }
const TABS = [
  ['all', 'All activity'],
  ['one', '1-to-1'],
  ['thanks', 'Thank-you notes'],
  ['joint', 'Joint calls'],
  ['connects', 'Specific connects'],
  ['referrals', 'Referrals'],
]

export default function Activity({ only }) {
  const db = useDB(), u = me(), people = scope(u), ids = people.map(p => p.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || (only ? 'joint' : 'all')
  const [f, setF] = useState({ d: '', by: '', k: '', to: '', note: '' })
  const [cf, setCf] = useState({ d: '', f: '', t: '', cp: '', ask: '', ow: '' })
  const [q, setQ] = useState(''), [mem, setMem] = useState('all')
  const [err, setErr] = useState(''), [ok, setOk] = useState('')
  const [connectErr, setConnectErr] = useState(''), [connectOk, setConnectOk] = useState('')
  
  const set = key => event => { setF({ ...f, [key]: event.target.value }); setOk('') }
  const setConnect = key => event => { setCf({ ...cf, [key]: event.target.value }); setConnectOk('') }
  const setTab = value => { setSearchParams(value === 'all' ? {} : { tab: value }); setErr(''); setConnectErr('') }
  const by = u.role === 'mb' ? u.id : +f.by
  
  const rows = [
    ...db.ones.map(o => ({ id: `one-${o.d}-${o.f}-${o.to}`, d: o.d, by: o.f, k: '1-to-1', to: o.to, note: '' })),
    ...db.refs.map((r, i) => ({ id: `ref-${i}`, d: r.d, by: r.f, k: 'Referral passed', to: r.to, note: [r.co, r.cn].filter(Boolean).join(' · ') })),
    ...db.notes.map((n, i) => ({ id: `note-${i}`, d: n.d, by: n.g, k: 'Thank-you note', to: n.to, note: n.det, source: n.src, value: n.v, status: n.st })),
    ...db.acts.map(a => ({ id: `act-${a.id}`, d: a.d, by: a.f, k: a.t, to: a.to, note: a.note })),
    ...db.connects.map(c => ({ id: `connect-${c.id}`, d: c.d, by: c.f, k: 'Specific connect', to: c.ow, target: c.t, note: `${c.t}${c.ask ? ` · ${c.ask}` : ''}`, status: c.st })),
  ].filter(row => ids.includes(row.by) || ids.includes(row.to))
    .filter(row => mem === 'all' || row.by === +mem)
    .filter(row => `${row.d} ${U(row.by)?.name || ''} ${U(row.to)?.name || ''} ${row.note || ''}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => dv(b.d) - dv(a.d))

  const visibleRows = rows.filter(row => {
    if (tab === 'one') return row.k === '1-to-1'
    if (tab === 'thanks') return row.k === 'Thank-you note'
    if (tab === 'joint') return row.k === 'Joint call'
    if (tab === 'referrals') return row.k === 'Referral passed'
    if (tab === 'connects') return row.k === 'Specific connect'
    return true
  })

  const connectList = db.connects.filter(c => ids.includes(c.f))
    .filter(c => mem === 'all' || c.f === +mem)
    .filter(c => `${c.d} ${U(c.f)?.name || ''} ${U(c.ow)?.name || ''} ${c.t} ${c.cp} ${c.ask}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => dv(b.d) - dv(a.d))

  const counts = [
  ['1-to-1s', db.ones.filter(o => ids.includes(o.f)).length, 'users'],
  ['Thank-you notes', db.notes.filter(n => ids.includes(n.g) || ids.includes(n.to)).length, 'file'],
  ['Joint calls', db.acts.filter(a => a.t === 'Joint call' && ids.includes(a.f)).length, 'activity'],
  ['Specific connects', db.connects.filter(c => ids.includes(c.f)).length, 'network'],
]

  const submitActivity = event => {
    event.preventDefault()
    const kind = tab === 'one' ? '1-to-1' : tab === 'joint' ? 'Joint call' : f.k
    if (!f.d) return setErr('Select the date.')
    if (tab === 'all' && !f.k) return setErr('Choose the activity.')
    if (!by) return setErr('Choose the reporting member.')
    if (!f.to) return setErr('Choose the member you met.')
    if (+f.to === by) return setErr('Choose a different member.')
    if (kind === '1-to-1') addOne(by, +f.to, fmtD(f.d))
    else addAct({ t: kind, f: by, to: +f.to, d: fmtD(f.d), note: f.note.trim() })
    setF({ d: '', by: '', k: '', to: '', note: '' }); setErr(''); setOk(toastOk('Activity recorded.'))
  }

  const submitConnect = event => {
    event.preventDefault()
    const member = u.role === 'mb' ? u.id : +cf.f
    if (!cf.d) return setConnectErr('Select the date requested.')
    if (!member) return setConnectErr('Choose the requesting member.')
    if (!cf.t.trim()) return setConnectErr('Enter the target company / industry.')
    const result = addConnect({ d: fmtD(cf.d), f: member, t: cf.t.trim(), cp: cf.cp.trim(), ask: cf.ask.trim(), ow: cf.ow ? +cf.ow : null })
    if (result) return setConnectErr(result)
    setCf({ d: '', f: '', t: '', cp: '', ask: '', ow: '' })
    setConnectErr(''); setConnectOk(toastOk('Specific connect added.'))
  }

  const showActivityForm = tab === 'all' || tab === 'one' || tab === 'joint'
  const canRecord = u.role !== 'mb' || tab === 'joint'

  return <>
    <PageHead eyebrow="MEMBER-TO-MEMBER TRACKER" title={only && tab === 'joint' ? 'Joint Calls' : 'Activity Tracker'}
      sub="Switch between 1-to-1s, thank-you notes, joint calls, specific connects and referrals. Search company names as you type." />
    
    <Tiles items={counts} />

    <div className="activity-tabs" role="tablist" aria-label="Activity types">
      {TABS.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key}
        className={`activity-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>)}
    </div>

    {/* --- FORM SECTION (Utilizing full width) --- */}
    {showActivityForm && canRecord && (
      <form className="card mb-4" onSubmit={submitActivity}>
        <h3 className="font-semibold mb-4">{tab === 'one' ? 'Record a 1-to-1' : tab === 'joint' ? 'Log a joint call' : 'Record an activity'}</h3>
        
        {/* Changed to lg:grid-cols-4 so the fields are wider and fill the card */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="lbl">Date *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="calendar" size={16}/></span>
              <input className="inp pl-10 w-full" type="date" value={f.d} onChange={set('d')} required />
            </div>
          </div>

          {u.role !== 'mb' && (
            <div>
              <label className="lbl">Reporting member</label>
              <Select className="inp w-full" value={f.by} onChange={set('by')} required>
                <option value="">Choose member</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
          )}

          {tab === 'all' && (
            <div>
              <label className="lbl">Activity *</label>
              <Select className="inp w-full" value={f.k} onChange={set('k')} required>
                <option value="">Choose activity</option>
                {KINDS.map(kind => <option key={kind}>{kind}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label className="lbl">With (member) *</label>
            <Select className="inp w-full" value={f.to} onChange={event => setF({ ...f, to: event.target.value })} required>
              <option value="">Choose member</option>
              {people.filter(person => person.id !== by).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
            </Select>
          </div>

          <div className="lg:col-span-4"> {/* Make notes span full width */}
            <label className="lbl">Notes</label>
            <input className="inp w-full" placeholder="Add any additional details..." value={f.note} onChange={set('note')} />
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
          <button className="btn"><Icon name="plus" size={15} stroke={2.6} /> Record</button>
          {err && <span className="text-sm text-bni" role="alert">{err}</span>}
          {ok && <span className="text-sm text-green-700">{ok}</span>}
          {tab === 'all' && <span className="text-xs text-gray-500 ml-auto">To log a referral, use <Link className="text-bni" to="/referrals">Referrals</Link>.</span>}
        </div>
      </form>
    )}

    {tab === 'thanks' && (
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-gray-600">Create and confirm thank-you notes in the existing notes page.</span>
        <Link className="btn-s" to="/notes">Open Thank-you Notes</Link>
      </div>
    )}

    {tab === 'connects' && (
      <form className="card mb-4" onSubmit={submitConnect}>
        <h3 className="font-semibold mb-4">Add a specific connect</h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="lbl">Date requested *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="calendar" size={16}/></span>
              <input className="inp pl-10 w-full" type="date" value={cf.d} onChange={setConnect('d')} required />
            </div>
          </div>

          {u.role !== 'mb' && (
            <div>
              <label className="lbl">Requesting member *</label>
              <Select className="inp w-full" value={cf.f} onChange={setConnect('f')} required>
                <option value="">Choose member</option>
                {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label className="lbl">Specific company / industry *</label>
            <input className="inp w-full" placeholder="e.g. Acme Corp" value={cf.t} onChange={setConnect('t')} required />
          </div>

          <div>
            <label className="lbl">Contact person / designation</label>
            <input className="inp w-full" placeholder="e.g. John Doe (CEO)" value={cf.cp} onChange={setConnect('cp')} />
          </div>

          <div>
            <label className="lbl">Specific ask / connection needed</label>
            <input className="inp w-full" placeholder="e.g. Introduction to procurement" value={cf.ask} onChange={setConnect('ask')} />
          </div>

          <div>
            <label className="lbl">Connect owner</label>
            <Select className="inp w-full" value={cf.ow} onChange={setConnect('ow')}>
              <option value="">Not assigned</option>
              {people.filter(person => person.id !== (u.role === 'mb' ? u.id : +cf.f)).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button className="btn"><Icon name="plus" size={15} stroke={2.6} /> Add connect</button>
          {connectErr && <span className="text-sm text-bni" role="alert">{connectErr}</span>}
          {connectOk && <span className="text-sm text-green-700">{connectOk}</span>}
        </div>
      </form>
    )}
    {/* --- END OF FORM SECTION --- */}

    {/* SEARCH BAR NOW SITS BELOW THE FORMS (With icons and full width) */}
    <div className="card filter-row activity-filter mb-4 flex items-center gap-3">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="search" size={18}/></span>
        <input className="inp pl-10 w-full" type="search" placeholder="Search company, member, or activity..." value={q} onChange={event => setQ(event.target.value)} />
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-gray-400"><Icon name="users" size={18}/></span>
        <Select className="inp w-48" value={mem} onChange={event => setMem(event.target.value)}>
          <option value="all">All members</option>
          {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
        </Select>
      </div>
      
      <span className="filter-count ml-2">{tab === 'connects' ? connectList.length : visibleRows.length} records</span>
    </div>

    {/* TABLE REMAINS AT THE BOTTOM */}
    {tab === 'connects' ? <Table head={['Date', 'Requesting member', 'Company / industry', 'Contact', 'Specific ask', 'Connect owner', 'Status', 'Business won']}
      rows={connectList.map(c => <tr key={c.id}><td className="td">{c.d}</td><td className="td">{U(c.f)?.name || '—'}</td>
        <td className="td !whitespace-normal min-w-[190px]">{c.t}</td><td className="td">{c.cp || '—'}</td><td className="td !whitespace-normal">{c.ask || '—'}</td>
        <td className="td">{U(c.ow)?.name || '—'}</td><td className="td"><Pill c={c.st === 'Won' ? 'g' : 'a'}>{c.st}</Pill></td><td className="td">{c.won ? fm(c.won) : '—'}</td></tr>)} />
      : tab === 'thanks' ? <Table head={['Date', 'From', 'To', 'Because of', 'Details', 'Value', 'Stage']}
        rows={visibleRows.map(row => <tr key={row.id}><td className="td">{row.d}</td><td className="td">{U(row.by)?.name || '—'}</td>
          <td className="td">{U(row.to)?.name || '—'}</td><td className="td">{row.source || '—'}</td>
          <td className="td !whitespace-normal">{row.note || '—'}</td><td className="td">{row.value ? fm(row.value) : '—'}</td>
          <td className="td">{row.status === 2 ? 'Converted to business' : row.status === 1 ? 'Value confirmed' : 'Thanked'}</td></tr>)} />
      : tab === 'referrals' ? <Table head={['Date', 'From', 'Passed to', 'Client / company', 'Status']}
        rows={visibleRows.map(row => <tr key={row.id}><td className="td">{row.d}</td><td className="td">{U(row.by)?.name || '—'}</td>
          <td className="td">{U(row.to)?.name || '—'}</td><td className="td">{row.note || '—'}</td><td className="td">Passed</td></tr>)} />
      : <Table head={['Date', 'Member', 'Activity', 'With / target', 'Details']}
        rows={visibleRows.map(row => <tr key={row.id}><td className="td">{row.d}</td><td className="td font-semibold">{U(row.by)?.name || '—'}</td>
          <td className="td"><Pill c={KC[row.k]}>{row.k}</Pill></td><td className="td">{row.k === 'Specific connect' ? row.target : U(row.to)?.name || '—'}</td>
          <td className="td !whitespace-normal">{row.k === 'Thank-you note' && row.value ? `${row.note || '—'} · ${fm(row.value)}` : row.note || '—'}</td></tr>)} />}
  </>
}