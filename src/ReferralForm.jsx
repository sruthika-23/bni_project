import Icon from './icons'
import { toastOk } from './toast'
import Select from './Select'
import { useState } from 'react'
import { me, scope, addRef, fmtD, isoToday } from './store'

const blank = () => ({ d: isoToday(), to: '', co: '', cn: '', cd: '', ph: '', em: '', loc: '', req: '' })
const validPhone = p => /^\d{10,13}$/.test(p.replace(/[\s\-()+]/g, ''))

export default function ReferralForm() {
  const u = me(), people = scope(u).filter(x => x.id !== u.id)
  const [f, setF] = useState(blank), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setOk('') }
  const submit = e => {
    e.preventDefault()
    if (!f.d) return setErr('Select the referral date.')
    if (!f.to) return setErr('Choose the member receiving the referral.')
    if (!f.co.trim()) return setErr('Enter the company / business name.')
    if (!f.cn.trim()) return setErr('Enter the contact person’s name.')
    if (!validPhone(f.ph)) return setErr('Enter a valid contact number (10 to 13 digits).')
    if (f.em.trim() && !/^\S+@\S+\.\S+$/.test(f.em.trim())) return setErr('Enter a valid email address or leave it blank.')
    addRef({ f: u.id, to: +f.to, d: fmtD(f.d), co: f.co.trim(), cn: f.cn.trim(), cd: f.cd.trim(), ph: f.ph.trim(), em: f.em.trim(), loc: f.loc.trim(), req: f.req.trim() })
    setF(blank()); setErr(''); setOk(toastOk('Referral passed successfully.'))
  }
  return <form className="card" onSubmit={submit}>
    <div className="form-head"><span className="form-head-icon">⇄</span><div><h3>Pass a Referral</h3><p>Share complete contact details so the receiving member can follow up quickly.</p></div><span className="form-step">New referral</span></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3">
      <div><label className="lbl">Date *</label><input className="inp" type="date" value={f.d} onChange={set('d')} /></div>
      <div><label className="lbl">Referral to (member) *</label><Select className="inp" value={f.to} onChange={set('to')}><option value="">Select receiving member</option>{people.map(p => <option value={p.id} key={p.id}>{p.name} · {p.cat}</option>)}</Select></div>
      <div><label className="lbl">Company / business name *</label><input className="inp" value={f.co} onChange={set('co')} placeholder="e.g. Yamaha Motors" /></div>
      <div><label className="lbl">Contact person name *</label><input className="inp" value={f.cn} onChange={set('cn')} /></div>
      <div><label className="lbl">Designation</label><input className="inp" value={f.cd} onChange={set('cd')} placeholder="e.g. Purchase Manager" /></div>
      <div><label className="lbl">Contact number *</label><input className="inp" type="tel" inputMode="tel" value={f.ph} onChange={set('ph')} placeholder="+91 98765 43210" /></div>
      <div><label className="lbl">Email</label><input className="inp" type="email" value={f.em} onChange={set('em')} /></div>
      <div><label className="lbl">Location / city</label><input className="inp" value={f.loc} onChange={set('loc')} /></div>
      <div className="lg:col-span-3"><label className="lbl">Requirement / notes</label><input className="inp" value={f.req} onChange={set('req')} placeholder="What does the contact need? Any timing or context for the receiving member." /></div>
    </div>
    <div className="flex items-center gap-3"><button className="btn"><Icon name="plus" size={15} stroke={2.6} /> Pass Referral</button>{err && <span className="text-sm text-bni">⚠ {err}</span>}{ok && <span className="text-sm text-green-700">✓ {ok}</span>}</div>
  </form>
}
