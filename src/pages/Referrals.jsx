import Select from '../Select'
import { Fragment, useState } from 'react'
import { useDB, me, U, setRef, canRef, RS, dv } from '../store'
import { Table, Pill, PageHead, RC } from '../ui'
import ReferralForm from '../ReferralForm'

export default function Referrals() {
  const db = useDB(), u = me(), [q, Sq] = useState(''), [open, setOpen] = useState(null)
  const list = db.refs.filter(r => u.role === 'sa' || U(r.f)?.team === u.team || U(r.to)?.team === u.team)
    .filter(r => [r.co, r.cn, r.ph, U(r.f)?.name, U(r.to)?.name].join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => dv(b.d) - dv(a.d))
  return <>
    <PageHead eyebrow="RELATIONSHIP BUILDING" title="Referrals" sub="Pass referrals with full contact details and follow their progress." />
    <ReferralForm />
    <div className="module-summary">
      <div className="card"><small>Referrals passed</small><b>{list.length}</b></div>
      <div className="card"><small>Received by your team</small><b>{list.filter(r => U(r.to)?.team === u.team).length}</b></div>
      <div className="card"><small>Converted</small><b>{list.filter(r => r.st === 'Won').length}</b></div>
    </div>
    <div className="card filter-row"><input className="inp" placeholder="Search by company, contact, phone or member..." value={q} onChange={e => Sq(e.target.value)} /><span className="filter-count">{list.length} referrals</span></div>
    <Table head={['Date', 'Given by', 'Referral to', 'Company', 'Contact person', 'Contact no.', 'Status', '']} rows={list.map(r => {
      const k = db.refs.indexOf(r)
      return <Fragment key={k}>
        <tr><td className="td">{r.d}</td><td className="td">{U(r.f)?.name}</td><td className="td">{U(r.to)?.name}</td><td className="td font-semibold">{r.co}</td>
          <td className="td">{r.cn ? <>{r.cn}{r.cd && <span className="text-gray-500"> · {r.cd}</span>}</> : '—'}</td>
          <td className="td">{r.ph ? <a className="text-bni" href={`tel:${r.ph.replace(/[\s\-()]/g, '')}`}>{r.ph}</a> : '—'}</td>
          <td className="td">{canRef(r) ? <Select className="inp !w-32" value={r.st} onChange={e => setRef(r, e.target.value)}>{RS.map(s => <option key={s}>{s}</option>)}</Select> : <Pill c={RC[r.st]}>{r.st}</Pill>}</td>
          <td className="td"><button className="btn-s" onClick={() => setOpen(open === k ? null : k)}>{open === k ? 'Hide' : 'Details'}</button></td></tr>
        {open === k && <tr><td className="td !whitespace-normal bg-gray-50" colSpan={8}><div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div><small className="text-gray-500 block">Email</small>{r.em ? <a className="text-bni" href={`mailto:${r.em}`}>{r.em}</a> : '—'}</div>
          <div><small className="text-gray-500 block">Location</small>{r.loc || '—'}</div>
          <div><small className="text-gray-500 block">Requirement / notes</small>{r.req || '—'}</div></div></td></tr>}
      </Fragment>
    })} />
  </>
}
