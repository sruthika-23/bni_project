import { useState } from 'react'
import { toastOk } from '../toast'
import { useDB, me, U, scope, fmtD, saveBusinessNetworkEntry } from '../store'
import { PageHead, Table } from '../ui'

const Field = ({ label, htmlFor, children, className = '' }) => (
  <div className={`network-field ${className}`}>
    <label className="lbl" htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
)

export default function BusinessNetwork() {
  const db = useDB(), u = me(), people = scope(u), ids = people.map(person => person.id)
  const isSA = u.role === 'sa'
  
  const [form, setForm] = useState(() => ({
    entryId: '',
    member: isSA ? '' : String(u.id),
    name: '',
    week: '',
    give: '',
    ask: '',
  }))
  const [err, setErr] = useState('')
  const editing = Boolean(form.entryId)
  
  const entries = db.fridayEntries
    .filter(entry => isSA || ids.includes(entry.member))
    .sort((a, b) => b.week.localeCompare(a.week))
    
  const set = key => event => { setForm(current => ({ ...current, [key]: event.target.value })); setErr('') }
  
  const reset = () => setForm({
    entryId: '',
    member: isSA ? '' : String(u.id),
    name: '',
    week: '',
    give: '',
    ask: '',
  })
  
  const submit = event => {
    event.preventDefault()
    const result = saveBusinessNetworkEntry({
      ...form,
      member: isSA ? form.member : u.id,
      entryId: form.entryId || undefined,
    })
    if (result) return setErr(result)
    setErr('')
    toastOk(`Business Network entry ${editing ? 'updated' : 'saved'}.`)
    reset()
  }
  
  const edit = entry => setForm({
    entryId: String(entry.id),
    member: String(entry.member),
    name: entry.name || U(entry.member)?.name || '',
    week: entry.week,
    give: entry.give,
    ask: entry.ask,
  })

  return <>
    <PageHead eyebrow="MEMBER NETWORK" title="Business Network" />

    <form className="card network-form" onSubmit={submit}>
      <h2 className="network-form-title">
        {isSA ? (editing ? 'Edit Business Network entry' : 'Add Business Network entry') : 'This week’s entry'}
      </h2>

      <div className="network-fields">
        {isSA && (
          <Field label="Date *" htmlFor="network-date">
            <input id="network-date" className="inp" type="date" value={form.week} onChange={set('week')} required />
          </Field>
        )}

        {isSA ? (
          <Field label="Name *" htmlFor="network-member">
            <select id="network-member" className="inp" value={form.member} onChange={set('member')} required>
              <option value="">Choose member…</option>
              {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="Name" htmlFor="network-name" className="network-name-field">
            <input id="network-name" className="inp" value={form.name} onChange={set('name')} placeholder="Your name" />
          </Field>
        )}

        <Field label="Specific Ask *" htmlFor="network-ask">
          <textarea id="network-ask" className="inp" rows={3} value={form.ask} onChange={set('ask')} required placeholder="Business or connection you are looking for" />
        </Field>

        <Field label="Specific Give *" htmlFor="network-give">
          <textarea id="network-give" className="inp" rows={3} value={form.give} onChange={set('give')} required placeholder="Business or connection you can provide" />
        </Field>
      </div>

      <div className="network-form-actions">
        <button className="btn">{editing ? 'Update entry' : 'Save entry'}</button>
        {editing && <button type="button" className="btn-s" onClick={reset}>Cancel edit</button>}
        {err && <span className="reg-msg text-bni" role="alert">{err}</span>}
      </div>
    </form>

    <div className="network-table-section">
      <Table
        head={['SNO', 'Date', 'Name', 'Specific Ask', 'Specific Give']}
        className="network-data-table"
        rows={entries.map((entry, i) => (
          <tr key={entry.id}>
            <td className="td network-sno">{i + 1}</td>
            <td className="td">{fmtD(entry.week)}</td>
            <td className="td font-semibold">
              <span className="network-name-cell">
                <span className="network-name">{entry.name || U(entry.member)?.name || '—'}</span>
                {isSA && <button type="button" className="btn-s" onClick={() => edit(entry)}>Edit</button>}
              </span>
            </td>
            <td className="td network-wrap">{entry.ask}</td>
            <td className="td network-wrap">{entry.give}</td>
          </tr>
        ))}
      />
    </div>
  </>
}