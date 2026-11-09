import { useState, useRef, useEffect, Children, isValidElement } from 'react'
import { createPortal } from 'react-dom'
import Icon from './icons'

const txt = n => Array.isArray(n) ? n.map(txt).join('') : (n == null || n === false || n === true) ? '' : String(n)

// Drop-in replacement for <select>: same props (value, onChange, <option> children, className),
// but with a searchable, keyboard-friendly, themed menu rendered in a portal.
export default function Select({ value, onChange, children, className = '', placeholder, disabled, id, ...rest }) {
  const opts = Children.toArray(children).filter(c => isValidElement(c) && c.type === 'option')
    .map(c => ({ v: String(c.props.value ?? txt(c.props.children)), l: txt(c.props.children) }))
  const [open, setOpen] = useState(false), [q, setQ] = useState(''), [hi, setHi] = useState(0), [pos, setPos] = useState(null)
  const btn = useRef(null), menu = useRef(null), search = useRef(null)
  const val = String(value ?? ''), cur = opts.find(o => o.v === val)
  const searchable = opts.length > 7
  const shown = opts.filter(o => o.l.toLowerCase().includes(q.trim().toLowerCase()))
  const isPh = !cur || (cur.v === '' )

  const place = () => {
    const r = btn.current?.getBoundingClientRect(); if (!r) return
    const w = Math.max(r.width, 230), left = Math.min(r.left, window.innerWidth - w - 10)
    const below = window.innerHeight - r.bottom, up = below < 300 && r.top > below
    setPos({ left: Math.max(8, left), width: w, ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }), max: Math.min(320, (up ? r.top : below) - 20) })
  }
  const openMenu = () => { if (disabled) return; place(); setQ(''); setHi(Math.max(0, opts.findIndex(o => o.v === val))); setOpen(true) }
  const close = (focus = false) => { setOpen(false); if (focus) btn.current?.focus() }
  const choose = o => { if (!o) return; onChange && onChange({ target: { value: o.v }, currentTarget: { value: o.v } }); close(true) }

  useEffect(() => {
    if (!open) return
    const down = e => { if (!menu.current?.contains(e.target) && !btn.current?.contains(e.target)) setOpen(false) }
    const scroll = e => { if (!menu.current?.contains(e.target)) setOpen(false) }
    const resize = () => setOpen(false)
    document.addEventListener('mousedown', down); window.addEventListener('scroll', scroll, true); window.addEventListener('resize', resize)
    setTimeout(() => (search.current || menu.current)?.focus(), 0)
    return () => { document.removeEventListener('mousedown', down); window.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', resize) }
  }, [open])
  useEffect(() => { if (open) menu.current?.querySelector(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' }) }, [hi, open])

  const onMenuKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(i => Math.min(shown.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(i => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); choose(shown[hi]) }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true) }
    else if (e.key === 'Tab') close()
  }
  const onBtnKey = e => { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open ? close() : openMenu() } }

  return <>
    <button ref={btn} id={id} type="button" disabled={disabled} className={`inp sel-trigger ${open ? 'is-open' : ''} ${className}`}
      aria-haspopup="listbox" aria-expanded={open} onClick={() => open ? close() : openMenu()} onKeyDown={onBtnKey} {...rest}>
      <span className={`sel-value ${isPh ? 'is-ph' : ''}`}>{cur ? cur.l : (placeholder || 'Select')}</span>
      <Icon name="chevron" size={16} stroke={2.4} className="sel-chev" />
    </button>
    {open && pos && createPortal(
      <div ref={menu} className="sel-menu" role="listbox" tabIndex={-1} onKeyDown={onMenuKey}
        style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}>
        {searchable && <div className="sel-search"><Icon name="search" size={15} /><input ref={search} value={q} placeholder="Search…" onChange={e => { setQ(e.target.value); setHi(0) }} /></div>}
        <div className="sel-list" style={{ maxHeight: Math.max(140, pos.max - (searchable ? 52 : 0)) }}>
          {shown.length ? shown.map((o, i) => <div key={o.v + i} data-i={i} role="option" aria-selected={o.v === val}
            className={`sel-opt ${o.v === val ? 'is-sel' : ''} ${i === hi ? 'is-hi' : ''} ${o.v === '' ? 'is-empty' : ''}`}
            onMouseEnter={() => setHi(i)} onMouseDown={e => e.preventDefault()} onClick={() => choose(o)}>
            <span>{o.l}</span>{o.v === val && <Icon name="check" size={15} stroke={2.6} />}
          </div>) : <div className="sel-none">No matches</div>}
        </div>
      </div>, document.body)}
  </>
}
