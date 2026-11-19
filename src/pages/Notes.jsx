import { useState } from 'react'
import Select from '../Select'
import { useDB, me, U, scope, toIso, addThankYouNote } from '../store'
import { PageHead } from '../ui'
import { toastOk } from '../toast'

const dateInput = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const noteStatus = note => note.status || (note.st === 2 ? 'Completed' : 'Pending')

export default function Notes() {
  const db = useDB(), u = me(), isSA = u.role === 'sa'
  const people = scope(u)
  const fromPeople = u.role === 'mb' ? [u] : people
  const [form, setForm] = useState({ g: String(u.id), to: '', det: '', converted: 'no' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date(), start = new Date(end)
    start.setMonth(start.getMonth() - 6)
    return { start: dateInput(start), end: dateInput(end) }
  })
  const [reportType, setReportType] = useState('given')

  const notes = db.notes.filter(n => isSA || (reportType === 'given' ? n.g === u.id : n.to === u.id))
    .filter(n => isSA || U(n.g)?.team === u.team)
    .filter(n => {
      const date = toIso(n.d)
      return date && (!dateRange.start || date >= dateRange.start) && (!dateRange.end || date <= dateRange.end)
    })
    .sort((a, b) => toIso(b.d).localeCompare(toIso(a.d)))
  const total = notes.reduce((sum, n) => sum + (+n.v || 0), 0)
  const runAt = new Date()
  const reportLabel = reportType === 'given' ? 'Given' : 'Received'
  const submitNote = event => {
    event.preventDefault()
    const error = addThankYouNote({ ...form, g: +form.g, to: +form.to, converted: form.converted === 'yes' })
    if (error) {
      setFormError(error)
      setFormSuccess('')
      return
    }
    setForm({ g: String(u.id), to: '', det: '', converted: 'no' })
    setFormError('')
    setFormSuccess(toastOk('Thank-you note added.'))
  }

  return <>
    <PageHead title="Thank-you notes" />

    <form className="card mb-4" onSubmit={submitNote}>
      <h2 className="text-lg font-semibold mb-4">Add a thank-you note</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="lbl" htmlFor="note-from">From *</label>
          <Select id="note-from" className="inp" value={form.g} onChange={event => {
            setForm({ ...form, g: event.target.value, ...(event.target.value === form.to ? { to: '' } : {}) })
            setFormError('')
            setFormSuccess('')
          }} required>
            {fromPeople.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
          </Select>
        </div>
        <div>
          <label className="lbl" htmlFor="note-to">To *</label>
          <Select id="note-to" className="inp" value={form.to} onChange={event => {
            setForm({ ...form, to: event.target.value })
            setFormError('')
            setFormSuccess('')
          }} required>
            <option value="">Select a member</option>
            {people.filter(person => person.id !== +form.g).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
          </Select>
        </div>
        <div>
          <label className="lbl" htmlFor="note-details">Thank-you note *</label>
          <textarea id="note-details" className="inp" value={form.det} onChange={event => {
            setForm({ ...form, det: event.target.value })
            setFormError('')
            setFormSuccess('')
          }} rows={3} required />
        </div>
        <div>
          <label className="lbl" htmlFor="note-converted">Business converted *</label>
          <Select id="note-converted" className="inp" value={form.converted} onChange={event => {
            setForm({ ...form, converted: event.target.value })
            setFormError('')
            setFormSuccess('')
          }} required>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button className="btn" type="submit">Add thank-you note</button>
        {formError && <span className="text-sm text-bni" role="alert">{formError}</span>}
        {formSuccess && <span className="text-sm text-green-700" role="status">{formSuccess}</span>}
      </div>
    </form>

    <div className="card !p-0 overflow-hidden" style={{ border: '1px solid #ccc' }}>
      <div style={{ padding: '16px 20px', background: '#f8f9fa', borderBottom: '1px solid #ccc' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>Chapter : TYFCB {reportLabel} Report</h3>
        <div style={{ display: 'flex', gap: '40px', fontSize: '13px', marginTop: '10px', color: '#333' }}>
          <div>Running User: <br/><b>{u.name}</b></div>
          <div>Run At: <br/><b>{runAt.toLocaleDateString('en-GB')} {runAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</b></div>
          <div>Chapter: <br/><b>Knights</b></div>
        </div>
      </div>

      <div className="tyfcb-report-controls">
        <div className="tyfcb-tabs" role="tablist" aria-label="TYFCB report type">
          {['given', 'received'].map(type => (
            <button key={type} type="button" role="tab" aria-selected={reportType === type}
              className={reportType === type ? 'active' : ''} onClick={() => setReportType(type)}>
              TYFCB {type === 'given' ? 'Given' : 'Received'}
            </button>
          ))}
        </div>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th colSpan={2} style={{ textAlign: 'left', paddingBottom: '8px', fontWeight: 'bold' }}>Parameters</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold', width: '150px' }}>Start Date</td>
              <td style={{ padding: '4px 0' }}><input aria-label="Report start date" type="date" className="inp" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} /></td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>End Date</td>
              <td style={{ padding: '4px 0' }}><input aria-label="Report end date" type="date" className="inp" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ overflowX: 'auto', padding: '0 20px 20px' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '900px', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ background: '#cf2030', color: '#fff' }}>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderRight: '1px solid #fff', borderBottom: '1px solid #fff', textAlign: 'left', padding: '8px' }}>Date</th>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderRight: '1px solid #fff', borderBottom: '1px solid #fff', textAlign: 'left', padding: '8px' }}>{reportType === 'given' ? 'Thank you to' : 'Given by'}</th>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderRight: '1px solid #fff', borderBottom: '1px solid #fff', textAlign: 'right', padding: '8px' }}>Amount</th>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderRight: '1px solid #fff', borderBottom: '1px solid #fff', textAlign: 'left', padding: '8px' }}>New/Repeat Business</th>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderRight: '1px solid #fff', borderBottom: '1px solid #fff', textAlign: 'left', padding: '8px' }}>Tier 1 (inside) referral, Tier 2 (outside) referral, Tier 3+ referral</th>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderRight: '1px solid #fff', borderBottom: '1px solid #fff', textAlign: 'left', padding: '8px' }}>Comments</th>
              <th className="th" style={{ background: 'transparent', color: '#fff', borderBottom: '1px solid #fff', textAlign: 'left', padding: '8px' }}>PALMS Status</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td className="td empty-cell" colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '14px', color: '#888' }}>No TYFCB slips found.</div>
                </td>
              </tr>
            ) : (
              <>
                {notes.map((n, i) => (
                  <tr key={n.id || `${n.d}-${n.g}-${n.to}-${i}`} style={{ borderBottom: '1px solid #ddd' }}>
                    <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}>{n.d}</td>
                    <td className="td font-semibold" style={{ padding: '8px', borderRight: '1px solid #ddd' }}>{U(reportType === 'given' ? n.to : n.g)?.name || '—'}</td>
                    <td className="td text-right font-medium" style={{ padding: '8px', borderRight: '1px solid #ddd' }}>{(+n.v || 0).toLocaleString('en-IN')}</td>
                    <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}>{n.bType || 'New'}</td>
                    <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}>{n.rType || 'Tier 2 (outside)'}</td>
                    <td className="td network-wrap" style={{ padding: '8px', borderRight: '1px solid #ddd', maxWidth: '200px' }}>{n.det || '—'}</td>
                    <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                        background: noteStatus(n) === 'Completed' ? '#e6f4ea' : '#f1f3f4',
                        color: noteStatus(n) === 'Completed' ? '#1e8e3e' : '#5f6368',
                        border: `1px solid ${noteStatus(n) === 'Completed' ? '#1e8e3e' : '#dadce0'}`
                      }}>
                        {noteStatus(n)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#fff4d2' }}>
                  <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}></td>
                  <td className="td font-bold" style={{ padding: '8px', borderRight: '1px solid #ddd', color: '#333' }}>Total</td>
                  <td className="td text-right font-bold" style={{ padding: '8px', borderRight: '1px solid #ddd', color: '#333' }}>{total.toLocaleString('en-IN')}</td>
                  <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}></td>
                  <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}></td>
                  <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}></td>
                  <td className="td" style={{ padding: '8px', borderRight: '1px solid #ddd' }}></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
}