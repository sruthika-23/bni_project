import { useEffect, useState } from 'react'
import Icon from './icons'

const subs = new Set(); let seq = 0
export const toast = (msg, type = 'ok') => { subs.forEach(f => f({ id: ++seq, msg, type })) }
export const toastOk = m => { toast(m, 'ok'); return m }

export function Toaster() {
  const [list, setList] = useState([])
  useEffect(() => {
    const f = t => { setList(l => [...l.slice(-3), t]); setTimeout(() => setList(l => l.filter(x => x.id !== t.id)), 4200) }
    subs.add(f); return () => { subs.delete(f) }
  }, [])
  const close = id => setList(l => l.filter(x => x.id !== id))
  return <div className="toaster" role="status" aria-live="polite">
    {list.map(t => <div key={t.id} className={`toast toast-${t.type}`}>
      <span className="toast-ico"><Icon name={t.type === 'err' ? 'alert' : 'check'} size={16} stroke={2.4} /></span>
      <span className="toast-msg">{t.msg}</span>
      <button type="button" className="toast-x" aria-label="Dismiss" onClick={() => close(t.id)}><Icon name="x" size={14} /></button>
      <i className="toast-bar" />
    </div>)}
  </div>
}
