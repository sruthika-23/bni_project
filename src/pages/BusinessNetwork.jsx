import { useState } from 'react'
import { toastOk } from '../toast'
import { useDB, me, U, scope, fridayWeek, saveBusinessNetworkEntry } from '../store'
import { PageHead, Table } from '../ui'

export default function BusinessNetwork() {
  const db = useDB(), u = me(), people = scope(u), ids = people.map(person => person.id)
  const week = fridayWeek()
  const existing = db.fridayEntries.find(entry => entry.member === u.id && entry.week === week)
  const [give, setGive] = useState(() => existing?.give || '')
  const [ask, setAsk] = useState(() => existing?.ask || '')
  const [err, setErr] = useState('')
  const entries = db.fridayEntries
    .filter(entry => u.role === 'sa' || ids.includes(entry.member))
    .sort((a, b) => b.week.localeCompare(a.week) || a.sno - b.sno)
  const submit = event => {
    event.preventDefault()
    const result = saveBusinessNetworkEntry({ give, ask })
    if (result) return setErr(result)
    setErr('')
    toastOk('Business Network entry saved.')
  }

  return <>
    <PageHead eyebrow="MEMBER NETWORK" title="Business Network" />
    {u.role !== 'sa' && <form className="card network-form" onSubmit={submit}>
      <h2>This week’s entry</h2>
      <div className="network-fields">
        <div><label className="lbl" htmlFor="network-sno">SNO</label><input id="network-sno" className="inp" value={existing?.sno || 'Assigned when saved'} readOnly /></div>
        <div><label className="lbl" htmlFor="network-name">Name</label><input id="network-name" className="inp" value={u.name} readOnly /></div>
        <div><label className="lbl" htmlFor="network-give">Specific Give *</label><textarea id="network-give" className="inp" rows="3" value={give} onChange={event => setGive(event.target.value)} required placeholder="Business or connection you can provide" /></div>
        <div><label className="lbl" htmlFor="network-ask">Specific Ask *</label><textarea id="network-ask" className="inp" rows="3" value={ask} onChange={event => setAsk(event.target.value)} required placeholder="Business or connection you are looking for" /></div>
      </div>
      <div className="network-form-actions">
        <button className="btn">{existing ? 'Update entry' : 'Save entry'}</button>
        {err && <span className="text-sm text-bni" role="alert">{err}</span>}
      </div>
    </form>}
    <div className="network-table-section">
      <Table head={['SNO', 'Name', 'Specific Give', 'Specific Ask']}
        rows={entries.map(entry => <tr key={entry.id}>
          <td className="td">{entry.sno}</td>
          <td className="td font-semibold">{U(entry.member)?.name || '—'}</td>
          <td className="td !whitespace-normal min-w-[220px]">{entry.give}</td>
          <td className="td !whitespace-normal min-w-[220px]">{entry.ask}</td>
        </tr>)} />
    </div>
  </>
}
